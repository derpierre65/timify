import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { StoreApiStoreFunctions } from 'src/lib/resources/interfaces/PiniaStoreApiInterface';
import { useCrudStore } from 'src/composables/store/crudStore';

type DayNote = {
  uid: string | number;
  date: string;
  text: string;
};

const useDayNoteStore = defineStore('dayNote', () => {
  const dayNoteStore = ref<DayNote[]>([]);
  const crudFunctions = useCrudStore(dayNoteStore);

  const notesByDate = computed(() => {
    const map: Record<string, DayNote> = {};
    for (const note of dayNoteStore.value) {
      map[note.date] = note;
    }
    return map;
  });

  return {
    dayNoteStore,
    notesByDate,
    ...crudFunctions,
  } satisfies StoreApiStoreFunctions<DayNote> & Record<string, unknown>;
}, {
  persist: {
    pick: [ 'dayNoteStore', ],
  },
});

export {
  type DayNote,
  useDayNoteStore,
};
