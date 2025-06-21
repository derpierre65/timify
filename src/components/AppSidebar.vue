<template>
  <div class="flex column tw:flex-auto">
    <div class="tw:text-center q-gutter-y-md">
      <!-- timer -->
      <div id="index-timer">
        <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.hours }}</span>
        <span class="tw:text-4xl tw:font-light tw:text-neutral-400">:</span>
        <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.minutes }}</span>
        <span class="tw:text-4xl tw:font-light tw:text-neutral-400">:</span>
        <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.seconds }}</span>
      </div>

      <!-- controls -->
      <div
        id="index-controls"
        class="tw:inline-flex tw:flex-row tw:items-center tw:justify-center
         tw:rounded-full tw:p-2 tw:bg-neutral-800 tw:gap-2"
      >
        <q-btn
          v-if="timeTrackerStore.currentStatus !== TimeTrackerStatus.Running"
          class="tw:rounded-full! tw:bg-green-900! tw:text-gray-200 tw!:focus:outline-none!"
          icon="fas fa-play"
          round
          @click="triggerAction(TimeTrackerStatus.Running)"
        >
          <q-tooltip>{{ $t('actions.start_work') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          class="tw:rounded-full! tw:bg-blue-800! tw:text-gray-200! tw:focus:outline-none!"
          icon="fas fa-pause"
          round
          @click="triggerAction(TimeTrackerStatus.Paused)"
        >
          <q-tooltip>{{ $t('actions.start_break') }}</q-tooltip>
        </q-btn>
        <q-btn
          :class="[
            timeTrackerStore.currentStatus !== TimeTrackerStatus.Stopped ?
              'tw:text-gray-200! tw:bg-red-900!' : 'tw:text-gray-400! tw:cursor-not-allowed! tw:bg-neutral-600!'
          ]"
          :disabled="timeTrackerStore.currentStatus === TimeTrackerStatus.Stopped"
          icon="fas fa-stop"
          round
          @click="triggerAction(TimeTrackerStatus.Stopped)"
        >
          <q-tooltip>{{ $t('actions.stop_work') }}</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-space />

    <div class="tw:bg-neutral-800 tw.h-12 flex justify-end items-center border-t border-black q-pa-xs">
      <router-link
        :to="{name: 'settings'}"
        class="tw:hover:text-neutral-100 tw:hover:bg-neutral-900 tw:w-8 tw:h-8
          flex justify-center items-center rounded-borders cursor-pointer"
      >
        <i class="fas fa-cog" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimeTrackerEntryType, TimeTrackerStatus, useTimeTrackerStore } from 'stores/timeTracker';
import { date } from 'quasar';
import EntryResource from 'src/lib/resources/EntryResource';
import { computed, inject, nextTick, Ref } from 'vue';
import { getEntryTourSteps, startTour } from 'src/lib/tour';
import { parseSeconds } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';
import { useSettingsStore } from 'stores/settings';

const timeTrackerStore = useTimeTrackerStore();
const settingsStore = useSettingsStore();

const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const currentTimer = computed(() => {
  if (!timeTrackerStore.currentEntry) {
    return parseSeconds(0);
  }

  return parseSeconds((currentDate.value.getTime() - timeTrackerStore.currentEntry.start.getTime()) / 1_000);
});

async function triggerAction(status: TimeTrackerStatus) {
  currentDate.value = new Date();

  if (timeTrackerStore.currentEntry) {
    const endOfDate = date.endOfDate(timeTrackerStore.currentEntry.start, 'day');
    if (currentDate.value > endOfDate) {
      const finalEnd = new Date();
      const currentStart = new Date(timeTrackerStore.currentEntry.start);
      const type = timeTrackerStore.currentEntry.type;

      while (currentStart < finalEnd) {
        const currentEnd = date.endOfDate(new Date(currentStart), 'day');

        // If currentEnd would exceed the final end time, use final end time instead
        const endTime = currentEnd > finalEnd ? finalEnd : currentEnd;

        if (timeTrackerStore.currentEntry && timeTrackerStore.currentEntry.start.getTime() === currentStart.getTime()) {
          timeTrackerStore.currentEntry.end = new Date(endTime);
        }
        else {
          await EntryResource.instance.store({
            start: new Date(currentStart),
            end: new Date(endTime),
            type,
          });
        }

        currentStart.setTime(currentEnd.getTime() + 1);
      }
    }
    else {
      timeTrackerStore.currentEntry.end = currentDate.value;
    }
  }

  if (status !== TimeTrackerStatus.Stopped) {
    await EntryResource.instance.store({
      start: new Date(),
      type: status === TimeTrackerStatus.Running ? TimeTrackerEntryType.Work : TimeTrackerEntryType.Break,
    });
  }

  if (!settingsStore.finishedTours.includes('entry')) {
    await nextTick();
    await startTour('entry', {
      steps: getEntryTourSteps(),
    });
  }
}
</script>
