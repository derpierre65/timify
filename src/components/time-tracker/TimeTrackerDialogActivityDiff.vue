<template>
  <q-dialog ref="dialogRef">
    <q-card class="tw:w-full tw:max-w-[800px]! tw:flex tw:flex-col">
      <q-card-section class="tw:flex tw:gap-1 tw:bg-neutral-950">
        <span>{{ $t('break_detected.title') }}</span>
      </q-card-section>
      <div class="tw:flex-auto">
        <q-card-section class="q-gutter-y-md">
          <p>
            <i18next :translation="$t('break_detected.line1')">
              <template #date>
                <strong>{{ lastActivityDate }}</strong>
              </template>
            </i18next>
          </p>

          <p>{{ $t('break_detected.line2') }}</p>
        </q-card-section>
      </div>

      <q-card-actions class="tw:bg-neutral-950" align="right">
        <q-btn
          :label="$t('break_detected.button_ignore')"
          color="red"
          no-caps
          @click="onDialogCancel"
        />
        <q-btn
          :label="$t('break_detected.button_apply')"
          color="primary"
          autofocus
          no-caps
          @click="apply"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date, useDialogPluginComponent } from 'quasar';
import { TimeTrackerStatus, useTimeTrackerStore } from 'stores/timeTracker';
import { computed, onUnmounted } from 'vue';
import { triggerAction } from 'src/lib/time-tracker';
import { useSettingsStore } from 'stores/settings';

const timeTrackerStore = useTimeTrackerStore();
const settingsStore = useSettingsStore();
const {
  dialogRef,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent();

const lastActivityDate = computed(() => {
  if (!timeTrackerStore.lastActivity) {
    return '';
  }

  return date.formatDate(timeTrackerStore.lastActivity, settingsStore.dateFormat + ' ' + settingsStore.timeFormat);
});

function apply() {
  triggerAction(TimeTrackerStatus.Stopped, new Date(timeTrackerStore.lastActivity)).then(onDialogOK);
}

timeTrackerStore.askLastActivity = true;

onUnmounted(() => {
  timeTrackerStore.askLastActivity = false;
});
</script>
