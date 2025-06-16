<template>
  <div>
    <div class="tw:pb-4 q-gutter-x-sm">
      <span class="tw:text-3xl">{{ $t('week.number', {number: weekNumber}) }}</span>
      <span class="tw:text-xl">00h 00m</span>
    </div>

    <div class="tw:space-y-4 tw:sm:space-y-0">
      <TimeTrackerDay
        v-for="day in days"
        :key="day.formattedDate"
        :day="day"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TimeTrackerDay from 'components/time-tracker/TimeTrackerDay.vue';
import { computed } from 'vue';
import { date } from 'quasar';
import { getDaysBetween } from 'src/lib/date';

const props = defineProps<{
  start: Date;
  end: Date;
}>();

defineOptions({
  name: 'TimeTrackerWeek',
});

const weekNumber = computed(() => date.getWeekOfYear(props.start));
const days = computed(() => {
  return getDaysBetween(props.start, props.end).reverse();
});

</script>
