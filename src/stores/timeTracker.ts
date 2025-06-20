import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date } from 'quasar';
import { StoreApiStoreFunctions } from 'src/lib/resources/interfaces/PiniaStoreApiInterface';
import { useCrudStore } from 'src/composables/store/crudStore';

type TimeTrackerEntry = {
  uid: string | number;
  start: Date;
  end: Date | null;
  type: TimeTrackerEntryType;
  pushedToJira: boolean;
};

enum TimeTrackerEntryType {
  Work = 'work',
  Break = 'break',
}

enum TimeTrackerStatus {
  Running,
  Paused,
  Stopped,
}

const useTimeTrackerStore = defineStore('timeTracker', () => {
  const entries = ref<TimeTrackerEntry[]>([]);
  const crudFunctions = useCrudStore(entries);

  const groupedEntries = computed(() => {
    const start = Date.now();
    const grouped: Record<string, TimeTrackerEntry[]> = Object.create(null);
    for (const entry of entries.value) {
      const entryDate = date.formatDate(entry.start, 'YYYY-MM-DD');
      grouped[entryDate] ??= [];
      grouped[entryDate].push(entry);
    }

    const required = Date.now() - start;
    console.log(`groupedEntries required ${required}ms`);
    if (required > 30) {
      console.warn('groupedEntries slowing down');
    }

    return grouped;
  });
  const currentEntry = computed(() => {
    const currentEntry = entries.value[entries.value.length - 1];
    if (!currentEntry || currentEntry.end) {
      return null;
    }

    return entries.value[entries.value.length - 1];
  });
  const currentStatus = computed(() => {
    if (!currentEntry.value) {
      return TimeTrackerStatus.Stopped;
    }

    return currentEntry.value.type === TimeTrackerEntryType.Work ? TimeTrackerStatus.Running : TimeTrackerStatus.Paused;
  });

  return {
    entries,
    groupedEntries,
    currentEntry,
    currentStatus,
    ...crudFunctions,
  } satisfies StoreApiStoreFunctions<TimeTrackerEntry> & Record<string, unknown>;
}, {
  persist: {
    serializer: {
      serialize(state) {
        return JSON.stringify(state);
      },
      deserialize(state) {
        const deserialized = JSON.parse(state);

        deserialized.entries.map((entry: TimeTrackerEntry) => {
          entry.start = new Date(entry.start);
          if (entry.end) {
            entry.end = new Date(entry.end);
          }
        });

        console.log('Loaded', deserialized.entries.length, 'entries');

        return deserialized;
      },
    },
  },
});

export {
  useTimeTrackerStore,
  TimeTrackerStatus,
  TimeTrackerEntryType,
  type TimeTrackerEntry,
};
