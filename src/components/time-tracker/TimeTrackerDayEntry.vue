<template>
  <div class="flex flex-wrap items-center tw:gap-4 tw:h-11 tw:hover:bg-dark-400 q-mx-sm">
    <i class="fas flex" :class="entry.type === TimeTrackerEntryType.Work ? 'fa-desktop tw:text-neutral-500' : 'fa-coffee tw:text-green-600'">
      <q-tooltip>{{ $t(`entry_type.${entry.type}`) }}</q-tooltip>
    </i>

    <div class="flex column tw:w-12">
      <span class="tw:text-xs">{{ $t('table.start') }}</span>
      <span>{{ startTime }}</span>
      <!--      <input-->
      <!--        v-if="false"-->
      <!--        ref="start"-->
      <!--        v-model="editEntry.start"-->
      <!--        class="bg-transparent"-->
      <!--        type="text"-->
      <!--        maxlength="5"-->
      <!--        size="5"-->
      <!--        @focusout="checkFieldChange('start', false)"-->
      <!--        @keyup.enter="saveEdit"-->
      <!--      >-->
    </div>

    <div class="flex column tw:w-12">
      <span class="tw:text-xs">{{ $t('table.end') }}</span>
      <template v-if="endTime">
        <span>{{ endTime }}</span>
        <!--        <input-->
        <!--          v-if="false"-->
        <!--          ref="end"-->
        <!--          v-model="editEntry.end"-->
        <!--          class="bg-transparent"-->
        <!--          type="text"-->
        <!--          maxlength="5"-->
        <!--          size="5"-->
        <!--          @focusout="checkFieldChange('end', false)"-->
        <!--          @keyup.enter="saveEdit"-->
        <!--        >-->
      </template>
      <i v-else class="fas fa-ellipsis-h">
        <q-tooltip>{{ $t('table.end_pending') }}</q-tooltip>
      </i>
    </div>

    <div class="flex column tw:w-16">
      <span class="tw:text-xs">{{ $t('table.total') }}</span>
      <span>{{ formattedTotalTime.hours }}h {{ formattedTotalTime.minutes }}m</span>
    </div>

    <div class="flex column">
      <span class="tw:text-xs">{{ $t('table.project') }}</span>
      <span>soon</span>
    </div>

    <div class="flex column">
      <span class="tw:text-xs">{{ $t('table.project_code') }}</span>
      <span>soon</span>
    </div>

    <q-space />

    <!-- TODO actions, delete, merge, change, push to jira etc. -->
  </div>
</template>

<script setup lang="ts">
import { TimeTrackerEntry, TimeTrackerEntryType } from 'stores/timeTracker';
import { computed, ref, watchEffect } from 'vue';
import { date, useInterval } from 'quasar';
import { parseSeconds } from 'src/lib/date';

const props = defineProps<{
  entry: TimeTrackerEntry;
}>();

const updateTime = useInterval();
const currentEndDate = ref(new Date());

const startTime = computed(() => {
  return date.formatDate(props.entry.start, 'HH:mm');
});

const endTime = computed(() => {
  if (!props.entry.end) {
    return null;
  }

  return date.formatDate(props.entry.end, 'HH:mm');
});

const totalTime = computed(() => {
  const end = props.entry.end || currentEndDate.value;

  return (end.getTime() - props.entry.start.getTime()) / 1_000;
});

const formattedTotalTime = computed(() => {
  return parseSeconds(totalTime.value);
});

watchEffect(() => {
  if (props.entry.end) {
    updateTime.removeInterval();
    return;
  }

  updateTime.registerInterval(() => {
    currentEndDate.value = new Date();
  }, 997);
});
</script>
