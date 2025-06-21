import AbstractResource from 'src/lib/resources/AbstractResource';
import { TimeTrackerEntry, TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';

export default class EntryResource extends AbstractResource<TimeTrackerEntry> {
  public override getDefaultValues(): TimeTrackerEntry {
    return {
      uid: null!,
      start: new Date(),
      type: TimeTrackerEntryType.Work,
      end: null,
      project: null,
      project_code: '',
      pushedToJira: false,
    };
  }

  override get piniaStore() {
    return useTimeTrackerStore();
  }
}
