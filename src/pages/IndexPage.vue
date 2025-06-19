<template>
  <q-page class="flex flex-col">
    <div class="tw:flex tw:flex-wrap tw:md:flex-nowrap tw:flex-auto">
      <!-- sidebar -->
      <div class="tw:relative tw:shadow-xl q-pt-md tw:w-full tw:md:w-64 tw:bg-gray-900">
        <div class="tw:text-center tw:sticky tw:top-4 q-gutter-y-md">
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
            class="tw:inline-flex tw:flex-row tw:items-center tw:justify-center tw:rounded-full tw:p-2 tw:bg-neutral-800 tw:gap-2"
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
import { computed, nextTick, onMounted, ref } from 'vue';
import { getWeekStartEnd, parseSeconds } from 'src/lib/date';
import TimeTrackerWeek from 'components/time-tracker/TimeTrackerWeek.vue';
import { date, uid, useInterval } from 'quasar';
import EntryResource from 'src/lib/resources/EntryResource';
import { getEntryTourSteps, shouldShowEntryTour, startTour } from 'src/lib/tour';
import { useTranslation } from 'i18next-vue';
import { useSettingsStore } from 'stores/settings';

const timeTrackerStore = useTimeTrackerStore();
const settingsStore = useSettingsStore();
const { t, } = useTranslation();
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

async function triggerAction(status: TimeTrackerStatus) {
  potentialEnd.value = new Date();
  if (timeTrackerStore.currentEntry) {
    const endOfDate = date.endOfDate(timeTrackerStore.currentEntry.start, 'day');
    if (potentialEnd.value > endOfDate) {
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
      timeTrackerStore.currentEntry.end = potentialEnd.value;
    }
  }

  if (status !== TimeTrackerStatus.Stopped) {
    await EntryResource.instance.store({
      start: new Date(),
      type: status === TimeTrackerStatus.Running ? TimeTrackerEntryType.Work : TimeTrackerEntryType.Break,
    });
  }
}

onMounted(async() => {
  if (settingsStore.finishedTours.includes('base')) {
    return;
  }

  await nextTick();
  await startTour([ 'base', ].concat(shouldShowEntryTour() ? [ 'entry', ] : []), {
    steps: [
      {
        title: t('tour.welcome_title'),
        intro: t('tour.welcome'),
        position: 'floating',
      },
      {
        title: t('tour.timer_title'),
        intro: t('tour.timer'),
        element: document.querySelector('#index-timer'),
      },
      {
        title: t('tour.controls_title'),
        intro: t('tour.controls'),
        element: document.querySelector('#index-controls'),
      },
      {
        title: t('tour.week_title'),
        intro: t('tour.week'),
        element: document.querySelector('.time-tracker-week-details'),
      },
      ...shouldShowEntryTour() ? getEntryTourSteps() : [
        {
          title: t('tour.part1_end_title'),
          intro: t('tour.part1_end'),
        },
      ],
    ],
  });
});

registerInterval(() => {
  potentialEnd.value = new Date();
}, 997);
</script>
