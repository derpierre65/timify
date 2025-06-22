<template>
  <!-- table -->
  <q-infinite-scroll :offset="250" class="q-gutter-y-md full-width q-pa-md" @load="onLoad">
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
</template>

<script lang="ts" setup>
import {
  inject,
  nextTick,
  onMounted,
  Ref,
  ref,
  watchEffect,
} from 'vue';
import { getWeekStartEnd } from 'src/lib/date';
import TimeTrackerWeek from 'components/time-tracker/TimeTrackerWeek.vue';
import { uid } from 'quasar';
import { getEntryTourSteps, shouldShowEntryTour, startTour } from 'src/lib/tour';
import { useTranslation } from 'i18next-vue';
import { useSettingsStore } from 'stores/settings';
import { currentDateInjectionKey } from 'src/lib/keys';

const settingsStore = useSettingsStore();
const { t, } = useTranslation();

const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const weeks = ref<Array<{
  uid: string;
  start: Date;
  end: Date;
}>>([]);

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

watchEffect(() => {
  if (!weeks.value[0]) {
    return;
  }

  if (currentDate.value > weeks.value[0].end) {
    weeks.value.unshift({
      uid: uid(),
      ...getWeekStartEnd(new Date()),
    });
  }
});
</script>
