import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date, useInterval } from 'quasar';
import { StoreApiStoreFunctions } from 'src/lib/resources/interfaces/PiniaStoreApiInterface';
import { useCrudStore } from 'src/composables/store/crudStore';
import type { Project } from 'stores/project';

type TimeTrackerEntry = {
  uid: string | number;
  start: Date;
  end: Date | null;
  type: TimeTrackerEntryType;
  project: Project['uid'] | null;
  project_code: string;
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
  const lastActivity = ref<Date | null>(null);
  const askLastActivity = ref(false);
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
    return entries.value.find((entry) => !entry.end);
  });
  const currentStatus = computed(() => {
    if (!currentEntry.value) {
      return TimeTrackerStatus.Stopped;
    }

    return currentEntry.value.type === TimeTrackerEntryType.Work ? TimeTrackerStatus.Running : TimeTrackerStatus.Paused;
  });

  useInterval().registerInterval(() => {
    if (askLastActivity.value) {
      return;
    }

    lastActivity.value = new Date();
  }, 10_000);

  return {
    entries,
    groupedEntries,
    currentEntry,
    currentStatus,
    lastActivity,
    askLastActivity,
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

        deserialized.lastActivity = deserialized.lastActivity ? new Date(deserialized.lastActivity) : null;

        deserialized.entries.map((entry: TimeTrackerEntry) => {
          entry.start = new Date(entry.start);
          if (entry.end) {
            entry.end = new Date(entry.end);
          }
          entry.project_code ??= '';
          entry.project ??= null;
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
