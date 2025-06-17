<template>
  <div class="flex flex-wrap items-center tw:gap-6 tw:h-11 tw:hover:bg-dark-400 q-mx-sm">
    <i class="fas flex" :class="entry.type === TimeTrackerEntryType.Work ? 'fa-desktop tw:text-neutral-500' : 'fa-coffee tw:text-green-600'">
      <q-tooltip>{{ $t(`entry_type.${entry.type}`) }}</q-tooltip>
    </i>

    <div class="flex column">
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

    <div class="flex column">
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
import { computed } from 'vue';
import { date } from 'quasar';

const props = defineProps<{
  entry: TimeTrackerEntry;
}>();

const startTime = computed(() => {
  return date.formatDate(props.entry.start, 'HH:mm');
});
const endTime = computed(() => {
  if (!props.entry.end) {
    return null;
  }

  return date.formatDate(props.entry.end, 'HH:mm');
});
</script>
