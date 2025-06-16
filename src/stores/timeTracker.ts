import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

type TimeTrackerEntry = {
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
    currentEntry,
    currentStatus,
  };
}, {
  persist: {
    serializer: {
      serialize(state) {
        return JSON.stringify(state);
      },
      deserialize(state) {
        const deserialized = JSON.parse(state);

        deserialized.entries.map((entry) => {
          entry.start = new Date(entry.start);
          if (entry.end) {
            entry.end = new Date(entry.end);
          }
        });

        return deserialized;
      },
    },
  },
});

export {
  useTimeTrackerStore,
  TimeTrackerStatus,
  TimeTrackerEntryType,
};
