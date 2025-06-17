<template>
  <div class="tw:border tw:w-full tw:border-neutral-600 tw:flex tw:flex-col tw:sm:flex-row">
    <div
      class="info-box tw:border-b tw:sm:border-b-0 tw:sm:border-r"
    >
      <span class="tw:font-semibold">{{ $t(`days.${day.dayOfWeek}`) }}</span>
      <span class="tw:text-xs">{{ day.formattedDate }}</span>
    </div>
    <div class="tw:flex-auto tw:bg-stone-900 relative-position tw:group">
      <!-- soon -->
      <div
        v-if="false"
        class="absolute tw:hidden tw:group-hover:block tw:z-20 tw:p-1 tw:text-xs tw:border
        tw:bg-neutral-800 tw:border-neutral-600 tw:-top-2 tw:space-x-2"
      >
        <q-icon name="fas fa-desktop" class="cursor-pointer tw:text-neutral-500">
          <q-tooltip>TODO</q-tooltip>
        </q-icon>
        <q-icon name="fas fa-coffee" class="cursor-pointer tw:text-green-600">
          <q-tooltip>TODO</q-tooltip>
        </q-icon>
      </div>

      <TimeTrackerDayEntry
        v-for="entry in sortedEntries"
        :key="entry.uid"
        :entry="entry"
      />
    </div>
    <div
      class="info-box tw:border-t tw:sm:border-t-0 tw:sm:border-l"
    >
      <span class="tw:font-semibold">
        <span>{{ formattedWorkTime.hours }}h {{ formattedWorkTime.minutes }}m</span>
        <q-tooltip>{{ $t('table.work_time') }}</q-tooltip>
      </span>
      <span class="tw:text-xs">
        <span>{{ formattedBreakTime.hours }}h {{ formattedBreakTime.minutes }}m</span>
        <q-tooltip>{{ $t('table.break_time') }}</q-tooltip>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref, watchEffect } from 'vue';
import { date } from 'quasar';
import { getDaysBetween, parseSeconds } from 'src/lib/date';
import { TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';
import TimeTrackerDayEntry from 'components/time-tracker/TimeTrackerDayEntry.vue';
import { currentDateInjectionKey } from 'src/lib/keys';

const props = defineProps<{
  day: ReturnType<typeof getDaysBetween>[0];
}>();

const emit = defineEmits<{
  updateTimeInformation: [data: {
    workTime: number;
    breakTime: number;
  }];
}>();

defineOptions({
  name: 'TimeTrackerDay',
});

const timeTrackerStore = useTimeTrackerStore();
const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const dateIdentifier = computed(() => {
  return date.formatDate(props.day.date, 'YYYY-MM-DD');
});

const entries = computed(() => {
  return (timeTrackerStore.groupedEntries[dateIdentifier.value] ?? []).slice();
});

const workTime = computed(() => {
  return entries.value.filter((entry) => entry.type === TimeTrackerEntryType.Work).reduce((previous, entry) => {
    return previous + ((entry.end || currentDate.value).getTime() - entry.start.getTime());
  }, 0) / 1_000;
});

const formattedWorkTime = computed(() => {
  return parseSeconds(workTime.value);
});

const breakTime = computed(() => {
  return entries.value.filter((entry) => entry.type === TimeTrackerEntryType.Break).reduce((previous, entry) => {
    return previous + ((entry.end || currentDate.value).getTime() - entry.start.getTime());
  }, 0) / 1_000;
});

const formattedBreakTime = computed(() => {
  return parseSeconds(breakTime.value);
});

const sortedEntries = computed(() => {
  return entries.value.slice().sort((a, b) => {
    return a.start > b.start ? -1 : 1;
  });
});

watchEffect(() => {
  emit('updateTimeInformation', {
    workTime: workTime.value,
    breakTime: breakTime.value,
  });
});
</script>

<style lang="scss" scoped>
@reference '../../css/app.scss';

.info-box {
  @apply tw:px-2 tw:py-1 tw:text-sm tw:text-center tw:flex tw:flex-wrap tw:items-center tw:justify-between;
  @apply tw:sm:justify-center tw:content-center tw:bg-stone-950 tw:border-neutral-600 tw:gap-0.5 tw:w-full tw:sm:w-24;
}
</style>
