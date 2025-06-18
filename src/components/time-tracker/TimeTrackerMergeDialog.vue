<template>
  <q-dialog ref="dialogRef">
    <q-card class="tw:w-full tw:max-w-[500px]! tw:flex tw:flex-col">
      <q-card-section class="tw:flex tw:gap-1 tw:bg-neutral-950">
        <span>{{ $t('merge.title') }}</span>

        <q-space />

        <q-icon
          name="fas fa-times"
          class="cursor-pointer"
          @click="onDialogCancel()"
        >
          <q-tooltip>{{ $t('global.close') }}</q-tooltip>
        </q-icon>
      </q-card-section>
      <div class="tw:flex-auto">
        <q-card-section class="q-gutter-y-md">
          <AppAlert type="warning" text>
            <i18next :translation="$t('merge.info')">
              <template #add>
                <strong class="tw:text-red-400">{{ formattedAdditionalTime.hours }}h {{ formattedAdditionalTime.minutes }}m</strong>
              </template>
            </i18next>
          </AppAlert>

          <TimeTrackerMergeDialogEntryBox :start="from.start" :end="from.end" />

          <div>
            <span>{{ $t('merge.to') }}</span>
          </div>

          <TimeTrackerMergeDialogEntryBox :start="to.start" :end="to.end" />

          <q-separator />

          <TimeTrackerMergeDialogEntryBox :start="newStart" :end="newEnd">
            <template #start>
              <TimeTrackerTimeInput
                v-model="newStart"
                :label="$t('table.start')"
                :error="!isValidStart"
                hide-bottom-space
                dense
              />
            </template>
            <template #end>
              <TimeTrackerTimeInput
                v-model="newEnd"
                :label="$t('table.end')"
                dense
              />
            </template>

            <div class="flex column tw:w-26">
              <span class="tw:text-xs">{{ $t('merge.current_difference') }}</span>
              <span
                class="tw:flex-auto flex column justify-center"
                :class="currentAdditionalTime.hours === '00' && currentAdditionalTime.minutes === '00' ?
                  'tw:text-green-400' : 'tw:text-red-400'"
              >{{ currentAdditionalTime.hours }}h {{ currentAdditionalTime.minutes }}m</span>
            </div>
          </TimeTrackerMergeDialogEntryBox>

          <AppAlert v-if="!isValidStart" type="error" text dense>
            {{ $t('merge.start_must_before_end') }}
          </AppAlert>
        </q-card-section>
      </div>

      <q-card-actions class="tw:bg-neutral-950" align="right">
        <q-btn
          :label="$t('global.confirm')"
          :disable="!canBeSaved"
          color="green"
          no-caps
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { useDialogPluginComponent, useInterval } from 'quasar';
import { parseSeconds } from 'src/lib/date';
import TimeTrackerMergeDialogEntryBox from 'components/time-tracker/TimeTrackerMergeDialogEntryBox.vue';
import { TimeTrackerEntry } from 'stores/timeTracker';
import { currentDateInjectionKey } from 'src/lib/keys';
import TimeTrackerTimeInput from 'components/time-tracker/TimeTrackerTimeInput.vue';
import AppAlert from 'components/AppAlert.vue';

const props = defineProps<{
  additionalTime: number;
  from: TimeTrackerEntry;
  to: TimeTrackerEntry;
  updateKey: string;
}>();

const {
  dialogRef,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent();
useInterval().registerInterval(() => {
  currentDate.value = new Date();
}, 997);

const originalStart = ref(props.updateKey === 'start' ? props.from.start : props.to.start);
const originalEnd = ref(props.updateKey === 'start' ? props.to.end : props.from.end);
const newStart = ref(props.updateKey === 'start' ? props.from.start : props.to.start);
const newEnd = ref(props.updateKey === 'start' ? props.to.end : props.from.end);

const currentDate = ref(new Date());

const currentAdditionalTime = computed(() => {
  const startValue = originalStart.value.getTime() - newStart.value.getTime();
  const endValue = (newEnd.value || currentDate.value).getTime() - (originalEnd.value || currentDate.value).getTime();

  return parseSeconds(props.additionalTime + ((startValue + endValue) / 1_000));
});

const formattedAdditionalTime = computed(() => {
  return parseSeconds(props.additionalTime);
});

const isValidStart = computed(() => {
  return newStart.value <= (newEnd.value || currentDate.value);
});

const canBeSaved = computed(() => {
  return isValidStart.value;
});

function confirm() {
  onDialogOK({
    start: newStart.value,
    end: newEnd.value,
  });
}

provide(currentDateInjectionKey, currentDate);
</script>
