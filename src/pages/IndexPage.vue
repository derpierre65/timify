<template>
  <q-page class="flex flex-col">
    <div class="tw:flex tw:flex-wrap tw:md:flex-nowrap tw:flex-auto">
      <!-- sidebar -->
      <div class="tw:relative tw:shadow-xl q-pt-md tw:w-full tw:md:w-64 tw:bg-gray-900">
        <div class="tw:text-center tw:sticky tw:top-4 q-gutter-y-md">
          <!-- timer -->
          <div>
            <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.hours }}</span>
            <span class="tw:text-4xl tw:font-light tw:text-neutral-400">:</span>
            <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.minutes }}</span>
            <span class="tw:text-4xl tw:font-light tw:text-neutral-400">:</span>
            <span class="tw:text-4xl tw:text-neutral-300">{{ currentTimer.seconds }}</span>
          </div>

          <!-- controls -->
          <div class="tw:inline-flex tw:flex-row tw:items-center tw:justify-center tw:rounded-full tw:p-2 tw:bg-neutral-800 tw:gap-2">
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
                timeTrackerStore.currentStatus !== TimeTrackerStatus.Stopped ? 'tw:text-gray-200! tw:bg-red-900!' : 'tw:text-gray-400! tw:cursor-not-allowed! tw:bg-neutral-600!'
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
      </div>
      <!-- table -->
      <div class="tw:w-full q-pa-md">
        <q-infinite-scroll :offset="250" class="q-gutter-y-md" @load="onLoad">
          <TimeTrackerWeek
            v-for="week in weeks"
            :key="week.uid"
            :start="week.start"
            :end="week.end"
          />
          <template #loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { TimeTrackerEntryType, TimeTrackerStatus, useTimeTrackerStore } from 'stores/timeTracker';
import { computed, ref } from 'vue';
import { getWeekStartEnd, parseSeconds } from 'src/lib/date';
import TimeTrackerWeek from 'components/time-tracker/TimeTrackerWeek.vue';
import { uid, useInterval } from 'quasar';

const timeTrackerStore = useTimeTrackerStore();
const { registerInterval, } = useInterval();

const potentialEnd = ref(new Date());
const weeks = ref<Array<{
  uid: string;
  start: Date;
  end: Date;
}>>([]);

const currentTimer = computed(() => {
  if (!timeTrackerStore.currentEntry) {
    return parseSeconds(0);
  }

  return parseSeconds((potentialEnd.value.getTime() - timeTrackerStore.currentEntry.start.getTime()) / 1_000);
});

function onLoad(index: number, done) {
  const lastWeek = weeks.value[weeks.value.length - 1];
  const nextWeek = new Date();
  if (lastWeek) {
    nextWeek.setTime(lastWeek.start.getTime() - 1);
  }

  weeks.value.push({
    uid: uid(),
    ...getWeekStartEnd(nextWeek),
  });
  done();
}

function triggerAction(status: TimeTrackerStatus) {
  potentialEnd.value = new Date();

  if (timeTrackerStore.currentEntry) {
    timeTrackerStore.currentEntry.end = potentialEnd.value;
  }

  if (status !== TimeTrackerStatus.Stopped) {
    timeTrackerStore.entries.push({
      start: new Date(),
      type: status === TimeTrackerStatus.Running ? TimeTrackerEntryType.Work : TimeTrackerEntryType.Break,
      end: null,
      pushedToJira: false,
    });
  }
}

registerInterval(() => {
  potentialEnd.value = new Date();
}, 997);
</script>
