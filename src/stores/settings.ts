import { defineStore } from 'pinia';
import { ref } from 'vue';

const useSettingsStore = defineStore('settings', () => {
  const firstWeekDay = ref(1); // 1 = Monday, 7 = Sunday;
  const dateFormat = ref('YYYY-MM-DD');
  const timeFormat = ref('HH:mm:ss');
  const storageType = ref<'store' | 'http'>('store');
  const mergeSettings = ref({
    showWarningDialog: true, // Show warning dialog if merge would exceed warnTime
    warningTime: 60, // Shows warning if merge would exceed this number of seconds
  });
  const finishedTours = ref<string[]>([]);

  function finishTour(tour: string) {
    finishedTours.value.push(tour);
  }

  return {
    dateFormat,
    timeFormat,
    firstWeekDay,
    mergeSettings,
    storageType,
    finishedTours,
    finishTour,
  };
}, {
  persist: true,
});

export {
  useSettingsStore,
};
