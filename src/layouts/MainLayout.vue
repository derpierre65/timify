<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      :width="250"
      class="tw:bg-gray-900 flex column"
      persistent
      show-if-above
      bordered
    >
      <AppSidebar />
    </q-drawer>

    <q-page-container>
      <q-page class="flex flex-col">
        <router-view v-slot="{ Component }">
          <keep-alive include="IndexPage">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </q-page>
    </q-page-container>

    <q-footer v-if="!settingsStore.hideFooter" class="tw:h-12 q-pa-sm tw:bg-neutral-900!" bordered>
      <div class="tw:container q-mx-auto flex full-height items-center">
        <div>
          This is an <a
            href="https://github.com/derpierre65/timify"
            class="link"
            target="_blank"
            rel="noopener noreferrer"
          >Open Source</a> Project
        </div>
        <q-space />
        <div>
          <span>Proudly made by <a
            href="https://www.derpierre65.dev/"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >derpierre65</a> with </span>
          <q-icon name="fa fa-heart" color="red">
            <q-tooltip>love</q-tooltip>
          </q-icon>
          <span> in Ireland</span>
        </div>
      </div>
    </q-footer>

    <q-dialog v-model="updateAvailable" position="bottom" no-focus seamless>
      <q-card class="tw:w-96">
        <q-card-section class="row items-center no-wrap">
          <div>{{ $t('global.update_available') }}</div>
          <q-space />
          <q-btn label="Refresh" color="primary" @click="refreshApplication" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'stores/settings';
import AppSidebar from 'components/AppSidebar.vue';
import { onMounted, ref } from 'vue';
import { Dialog, useInterval } from 'quasar';
import axios from 'axios';
import { useTimeTrackerStore } from 'stores/timeTracker';
import TimeTrackerDialogActivityDiff from 'components/time-tracker/TimeTrackerDialogActivityDiff.vue';

const settingsStore = useSettingsStore();
const timeTrackerStore = useTimeTrackerStore();

const updateAvailable = ref(false);

function refreshApplication() {
  window.location.reload();
}

onMounted(() => {
  if (!timeTrackerStore.currentEntry || !timeTrackerStore.lastActivity) {
    return;
  }

  const lastActivity = new Date(timeTrackerStore.lastActivity);
  if (lastActivity < timeTrackerStore.currentEntry.start) {
    return;
  }

  const lastActivityDiff = (new Date() - lastActivity) / 1_000;
  if (lastActivityDiff < settingsStore.activityWarning * 60) {
    return;
  }

  Dialog.create({
    component: TimeTrackerDialogActivityDiff,
    componentProps: {
      persistent: true,
    },
  });
});

if (!import.meta.env.DEV) {
  useInterval().registerInterval(() => {
    if (updateAvailable.value) {
      return;
    }

    axios
      .get('/assets/version.json', {
        baseURL: '',
        params: {
          t: Date.now(),
        },
      })
      .then(({ data, }) => {
        if (data.date.toString() !== import.meta.env.VITE_BUILD_TIMESTAMP) {
          updateAvailable.value = true;
        }
      })
      .catch(() => {
        // do nothing
      });
  }, 20_000);
}
</script>

