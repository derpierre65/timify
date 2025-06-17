import { defineStore } from 'pinia';
import { ref } from 'vue';

const useSettingsStore = defineStore('settings', () => {
  const firstWeekDay = ref(1); // 1 = Monday, 7 = Sunday;
  const dateFormat = ref('YYYY-MM-DD');
  const timeFormat = ref('HH:mm:ss');

  return {
    dateFormat,
    timeFormat,
    firstWeekDay,
  };
}, {
  persist: true,
});

export {
  useSettingsStore,
};
