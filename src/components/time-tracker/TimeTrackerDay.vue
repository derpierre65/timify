<template>
  <div class="tw:border tw:w-full tw:border-neutral-600 tw:flex tw:flex-col tw:sm:flex-row">
    <div
      class="info-box tw:border-b tw:sm:border-b-0 tw:sm:border-r"
    >
      <span class="tw:font-semibold">{{ $t(`days.${day.dayOfWeek}`) }}</span>
      <span class="tw:text-xs">{{ day.formattedDate }}</span>
    </div>
    <div class="tw:flex-auto tw:bg-stone-900">
      <!-- soon -->
    </div>
    <div
      class="info-box tw:border-t tw:sm:border-t-0 tw:sm:border-l"
    >
      <span class="tw:font-semibold">00h 00m</span>
      <span class="tw:text-xs">00h 00m</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDaysBetween } from 'src/lib/date';

const props = defineProps<{
  day: ReturnType<typeof getDaysBetween>[0];
}>();

defineOptions({
  name: 'TimeTrackerDay',
});
</script>

<style lang="scss" scoped>
@reference '../../css/app.scss';

.info-box {
  @apply tw:px-2 tw:py-1 tw:text-sm tw:text-center tw:flex tw:flex-wrap tw:items-center tw:justify-between;
  @apply tw:sm:justify-center tw:content-center tw:bg-stone-950 tw:border-neutral-600 tw:gap-0.5 tw:w-full tw:sm:w-24;
}
</style>
