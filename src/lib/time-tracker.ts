import { TimeTrackerEntry, TimeTrackerEntryType, TimeTrackerStatus, useTimeTrackerStore } from 'stores/timeTracker';
import { date } from 'quasar';
import EntryResource from 'src/lib/resources/EntryResource';
import { useSettingsStore } from 'stores/settings';

async function triggerAction(status: TimeTrackerStatus, currentDate: Date) {
  const timeTrackerStore = useTimeTrackerStore();
  const settingsStore = useSettingsStore();
  const defaultFields: Partial<TimeTrackerEntry> = {};

  if (settingsStore.defaultProjectId) {
    defaultFields.project = settingsStore.defaultProjectId;
  }
  if (settingsStore.defaultProjectCode) {
    defaultFields.project_code = settingsStore.defaultProjectCode;
  }

  if (timeTrackerStore.currentEntry) {
    const endOfDate = date.endOfDate(timeTrackerStore.currentEntry.start, 'day');
    if (currentDate > endOfDate) {
      const finalEnd = currentDate;
      const currentStart = new Date(timeTrackerStore.currentEntry.start);
      const type = timeTrackerStore.currentEntry.type;

      while (currentStart < finalEnd) {
        const currentEnd = date.endOfDate(new Date(currentStart), 'day');

        // If currentEnd would exceed the final end time, use final end time instead
        const endTime = currentEnd > finalEnd ? finalEnd : currentEnd;

        if (timeTrackerStore.currentEntry && timeTrackerStore.currentEntry.start.getTime() === currentStart.getTime()) {
          timeTrackerStore.currentEntry.end = new Date(endTime);
        }
        else {
          await EntryResource.instance.store({
            start: new Date(currentStart),
            end: new Date(endTime),
            type,
            ...defaultFields,
          });
        }

        currentStart.setTime(currentEnd.getTime() + 1);
      }
    }
    else {
      timeTrackerStore.currentEntry.end = currentDate;
    }
  }

  if (status !== TimeTrackerStatus.Stopped) {
    await EntryResource.instance.store({
      start: new Date(),
      type: status === TimeTrackerStatus.Running ? TimeTrackerEntryType.Work : TimeTrackerEntryType.Break,
      ...defaultFields,
    });
  }
}


export {
  triggerAction,
};
