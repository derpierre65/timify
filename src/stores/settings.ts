import { defineStore } from 'pinia';
import { ref } from 'vue';

const useSettingsStore = defineStore('settings', () => {
  const firstWeekDay = ref(1); // 1 = Monday, 7 = Sunday;
  const dateFormat = ref('YYYY-MM-DD');
  const timeFormat = ref('HH:mm:ss');
  const mergeSettings = ref({
    showWarningDialog: true, // Show warning dialog if merge would exceed warnTime
    warningTime: 60, // Shows warning if merge would exceed this number of seconds
  });

  return {
    dateFormat,
    timeFormat,
    firstWeekDay,
    mergeSettings,
  };
}, {
  persist: true,
});

export {
  useSettingsStore,
};
