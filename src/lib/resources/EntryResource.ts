import AbstractResource from 'src/lib/resources/AbstractResource';
import { TimeTrackerEntry, TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';

export default class EntryResource extends AbstractResource<TimeTrackerEntry> {
  public override getDefaultValues(): TimeTrackerEntry {
    return {
      uid: null!,
      start: new Date(),
      type: TimeTrackerEntryType.Work,
      end: null,
      pushedToJira: false,
    };
  }

  override get piniaStore() {
    return useTimeTrackerStore();
  }

  static override get instance() {
    return super.getInstance<EntryResource>();
  }
}
