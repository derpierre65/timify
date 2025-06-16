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

const useTimeTrackerStore = defineStore('jira', () => {
  const entries = ref<TimeTrackerEntry[]>([]);

  const currentStatus = computed(() => {
    const currentEntry = entries.value[entries.value.length - 1];
    if (!currentEntry) {
      return TimeTrackerStatus.Stopped;
    }

    return currentEntry.type === TimeTrackerEntryType.Work ? TimeTrackerStatus.Running : TimeTrackerStatus.Paused;
  });

  return {
    entries,
    currentStatus,
  };
}, {
  persist: true,
});

export {
  useTimeTrackerStore,
  TimeTrackerStatus,
};
