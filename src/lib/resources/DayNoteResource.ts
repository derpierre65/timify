import AbstractResource from 'src/lib/resources/AbstractResource';
import { type DayNote, useDayNoteStore } from 'stores/dayNote';

export default class DayNoteResource extends AbstractResource<DayNote> {
  public override getDefaultValues(): DayNote {
    return {
      uid: null!,
      date: '',
      text: '',
    };
  }

  override get piniaStore() {
    return useDayNoteStore();
  }
}
