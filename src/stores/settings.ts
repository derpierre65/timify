import { defineStore } from 'pinia';
import { ref } from 'vue';

const useSettingsStore = defineStore('settings', () => {
  const firstWeekDay = ref(1); // 1 = Monday, 7 = Sunday;
  const dateFormat = ref('YYYY-MM-DD');

  return {
    dateFormat,
    firstWeekDay,
  };
}, {
  persist: true,
});

export {
  useSettingsStore,
};
