import i18next from 'i18next';
import { Dialog, type QBtnProps } from 'quasar';
import introJs from 'intro.js';
import type { IntroStep } from 'intro.js/src/core/steps';
import type { Options } from 'intro.js/src/option';
import { useSettingsStore } from 'stores/settings';

function shouldShowEntryTour() {
  return !!document.querySelector('.time-tracker-day.has-entries');
}

function getEntryTourSteps() {
  return [
    {
      title: i18next.t('tour.day.title'),
      intro: i18next.t('tour.day.info'),
      element: document.querySelector('.time-tracker-day.has-entries'),
      position: 'floating',
    },
    {
      title: i18next.t('tour.day.title'),
      intro: i18next.t('tour.day.weekday'),
      position: 'right',
      element: document.querySelector('.time-tracker-day.has-entries .info-box:first-of-type'),
    },

    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.type'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(1)'),

    },
    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.start'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(2)'),
    },
    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.end'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(3)'),
    },

    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.total'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(4)'),
    },
    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.project'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(5)'),
    },
    {
      title: i18next.t('tour.day.entry.title'),
      intro: i18next.t('tour.day.entry.project_code'),
      element: document.querySelector('.time-tracker-day.has-entries div:nth-child(2) :first-child :nth-child(6)'),
    },

    {
      title: i18next.t('tour.day.entry.options_title'),
      intro: i18next.t('tour.day.entry.options_merge'),
      element: document.querySelector('.time-tracker-day.has-entries .time-tracker-day-merge-button'),
    },
    {
      title: i18next.t('tour.day.entry.options_title'),
      intro: i18next.t('tour.day.entry.options_more'),
      element: document.querySelector('.time-tracker-day.has-entries .time-tracker-day-options-button'),
    },

    {
      title: i18next.t('tour.day.title'),
      intro: i18next.t('tour.day.total'),
      position: 'left',
      element: document.querySelector('.time-tracker-day.has-entries .info-box:last-of-type'),
    },

    {
      title: i18next.t('tour.ready_to_go_title'),
      intro: i18next.t('tour.ready_to_go'),
    },
  ] as Array<Partial<IntroStep>>;
}

function startTour(id: string | string[], options: Partial<Options>) {
  id = Array.isArray(id) ? id : [ id, ];

  console.log(id);

  return introJs()
    .setOptions(options)
    .onbeforeexit(function() {
      if (this.currentStep() >= this._introItems.length - 1) {
        return true;
      }

      return new Promise((resolve) => {
        Dialog
          .create({
            message: i18next.t('tour.confirm_exit'),
            ok: {
              color: 'primary',
              label: i18next.t('global.confirm'),
            } as QBtnProps,
            cancel: {
              label: i18next.t('global.cancel'),
              color: 'positive',
              flat: true,
            } as QBtnProps,
          })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
          .onDismiss(() => resolve(false));
      });
    })
    .onexit(() => {
      const settingsStore = useSettingsStore();
      for (const tour of id) {
        settingsStore.finishTour(tour);
      }
    })
    .start();
}

export {
  shouldShowEntryTour,
  getEntryTourSteps,
  startTour,
};
