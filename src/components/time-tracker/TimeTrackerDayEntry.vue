<template>
  <div class="flex flex-wrap items-center tw:gap-4 tw:h-11 tw:hover:bg-neutral-800 q-px-sm">
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

    <div class="flex items-center">
      <!-- todo add merge -->
      <q-btn icon="fas fa-arrow-up" size="sm" round disable>
        <q-tooltip>{{ $t('table.actions.merge_up') }}</q-tooltip>
      </q-btn>
      <q-btn icon="fas fa-arrow-down" size="sm" round disable>
        <q-tooltip>{{ $t('table.actions.merge_down') }}</q-tooltip>
      </q-btn>

      <q-btn
        icon="fas fa-ellipsis-h"
        size="sm"
        round
      >
        <q-menu>
          <q-list>
            <q-item v-close-popup clickable @click="deleteEntry">
              <q-item-section>
                <q-item-label>{{ $t('actions.delete') }}</q-item-label>
              </q-item-section>
            </q-item>
            <!-- todo add change -->
            <!-- todo add jira push -->
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimeTrackerEntry, TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';
import { computed, inject, Ref } from 'vue';
import { date } from 'quasar';
import { parseSeconds } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';

const props = defineProps<{
  entry: TimeTrackerEntry;
}>();

const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;
const timeTrackerStore = useTimeTrackerStore();

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
  const end = props.entry.end || currentDate.value;

  return (end.getTime() - props.entry.start.getTime()) / 1_000;
});

const formattedTotalTime = computed(() => {
  return parseSeconds(totalTime.value);
});

function deleteEntry() {
  timeTrackerStore.entries.splice(timeTrackerStore.entries.indexOf(props.entry), 1);
}
</script>
