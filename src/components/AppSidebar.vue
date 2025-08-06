<template>
  <div class="flex column tw:flex-auto tw:max-w-full">
    <div class="tw:text-center q-gutter-y-md q-pt-md tw:max-w-full q-px-sm">
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

      <ProjectSelect
        v-model="settingsStore.defaultProjectId"
        :label="$t('settings.default_project')"
        dense
        clearable
      />
      <q-input
        v-model="settingsStore.defaultProjectCode"
        :label="$t('settings.default_project_code')"
        dense
        clearable
      />
    </div>

    <q-space />

    <div class="tw:bg-neutral-800 tw:h-12 flex justify-end items-center tw:border-t tw:border-white/28 q-pa-xs">
      <router-link
        :to="{name: 'settings'}"
        class="tw:hover:text-neutral-100 tw:hover:bg-neutral-900 tw:w-8 tw:h-8
          flex justify-center items-center rounded-borders cursor-pointer"
      >
        <i class="fas fa-cog" />
        <q-tooltip>{{ $t('pages.settings') }}</q-tooltip>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimeTrackerStatus, useTimeTrackerStore } from 'stores/timeTracker';
import { computed, inject, nextTick, Ref } from 'vue';
import { getEntryTourSteps, startTour } from 'src/lib/tour';
import { parseSeconds } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';
import { useSettingsStore } from 'stores/settings';
import ProjectSelect from 'components/ProjectSelect.vue';
import { triggerAction as _triggerAction } from 'src/lib/time-tracker';

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

  await _triggerAction(status, currentDate.value);

  if (!settingsStore.finishedTours.includes('entry')) {
    await nextTick();
    await startTour('entry', {
      steps: getEntryTourSteps(),
    });
  }
}
</script>
