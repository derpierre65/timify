<template>
  <div class="time-tracker-week">
    <div class="tw:pb-4 q-gutter-x-sm time-tracker-week-details">
      <span class="tw:text-3xl">{{ $t('week.number', {number: weekNumber}) }}</span>
      <span class="tw:text-xl">{{ formattedWorkTime.hours }}h {{ formattedWorkTime.minutes }}m</span>
    </div>

    <div class="tw:space-y-4">
      <TimeTrackerDay
        v-for="day in days"
        :key="day.formattedDate"
        :day="day"
        @update-time-information="updateTimeInformation(day, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TimeTrackerDay from 'components/time-tracker/TimeTrackerDay.vue';
import { computed, ref, UnwrapRef } from 'vue';
import { date } from 'quasar';
import { getDaysBetween, parseSeconds } from 'src/lib/date';

const props = defineProps<{
  start: Date;
  end: Date;
}>();

defineOptions({
  name: 'TimeTrackerWeek',
});

const dayTimeInformation = ref<Record<string, {
  workTime: number;
  breakTime: number;
}>>({});

const weekNumber = computed(() => {
  return date.getWeekOfYear(props.start);
});

const days = computed(() => {
  return getDaysBetween(props.start, props.end).reverse();
});

const workTime = computed(() => {
  return Object.keys(dayTimeInformation.value).reduce((previous, key) => {
    return previous + dayTimeInformation.value[key]!.workTime;
  }, 0);
});

const formattedWorkTime = computed(() => {
  return parseSeconds(workTime.value);
});

function updateTimeInformation(
  day: ReturnType<typeof getDaysBetween>[0],
  event: UnwrapRef<typeof dayTimeInformation>[string],
) {
  dayTimeInformation.value[day.formattedDate] = event;
}
</script>
