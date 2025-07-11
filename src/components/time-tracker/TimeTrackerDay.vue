<template>
  <div
    :class="{'has-entries': sortedEntries.length}"
    class="time-tracker-day tw:border tw:w-full tw:border-neutral-600 tw:flex tw:flex-col tw:sm:flex-row"
  >
    <div class="info-box tw:border-b tw:sm:border-b-0 tw:sm:border-r">
      <span class="tw:font-semibold">{{ $t(`days.${day.dayOfWeek}`) }}</span>
      <span class="tw:text-xs">{{ day.formattedDate }}</span>
    </div>
    <div class="tw:flex-auto tw:bg-stone-900 relative-position tw:group tw:divide-solid tw:divide-neutral-600 tw:divide-y-1">
      <!-- soon -->
      <div
        class="absolute tw:hidden tw:group-hover:block tw:z-20 tw:p-1 tw:text-xs tw:border
        tw:bg-neutral-800 tw:border-neutral-600 tw:-top-2 tw:space-x-2"
      >
        <q-icon
          name="fas fa-desktop"
          class="cursor-pointer tw:text-neutral-500"
          @click="createEntry(TimeTrackerEntryType.Work)"
        >
          <q-tooltip>{{ $t('table.create_entry_work') }}</q-tooltip>
        </q-icon>
        <q-icon
          name="fas fa-coffee"
          class="cursor-pointer tw:text-green-600"
          @click="createEntry(TimeTrackerEntryType.Break)"
        >
          <q-tooltip>{{ $t('table.create_entry_break') }}</q-tooltip>
        </q-icon>
      </div>

      <TimeTrackerDayEntry
        v-if="tempItem"
        :entry="tempItem"
        @cancel-edit="tempItem = null"
      />

      <TimeTrackerDayEntry
        v-for="(entry, index) in sortedEntries"
        :key="entry.uid"
        :entry="entry"
        :can-merge-upwards="index !== 0"
        :can-merge-downwards="index < sortedEntries.length - 1"
        @merge="mergeEntries(entry, index, $event)"
      />
    </div>
    <div class="info-box tw:border-t tw:sm:border-t-0 tw:sm:border-l">
      <span class="tw:font-semibold">
        <span>{{ formattedWorkTime.hours }}h {{ formattedWorkTime.minutes }}m</span>
        <q-tooltip>{{ $t('table.work_time') }}</q-tooltip>
      </span>
      <span class="tw:text-xs">
        <span>{{ formattedBreakTime.hours }}h {{ formattedBreakTime.minutes }}m</span>
        <q-tooltip>{{ $t('table.break_time') }}</q-tooltip>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  ref,
  Ref,
  watchEffect,
} from 'vue';
import { date, Dialog } from 'quasar';
import { getDaysBetween, parseSeconds } from 'src/lib/date';
import { TimeTrackerEntry, TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';
import { useSettingsStore } from 'stores/settings';
import TimeTrackerDayEntry from 'components/time-tracker/TimeTrackerDayEntry.vue';
import { currentDateInjectionKey } from 'src/lib/keys';
import TimeTrackerDialogMerge from 'components/time-tracker/TimeTrackerDialogMerge.vue';
import { useTranslation } from 'i18next-vue';
import EntryResource from 'src/lib/resources/EntryResource';
import { showSuccessMessage } from 'src/lib/ui';

const props = defineProps<{
  day: ReturnType<typeof getDaysBetween>[0];
}>();

const emit = defineEmits<{
  updateTimeInformation: [data: {
    workTime: number;
    breakTime: number;
  }];
}>();

const tempItem = ref<TimeTrackerEntry | null>(null);

const timeTrackerStore = useTimeTrackerStore();
const settingsStore = useSettingsStore();
const { t, } = useTranslation();
const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const dateIdentifier = computed(() => {
  return date.formatDate(props.day.date, 'YYYY-MM-DD');
});

const entries = computed(() => {
  return (timeTrackerStore.groupedEntries[dateIdentifier.value] ?? []).slice();
});

const workTime = computed(() => {
  return entries.value.filter((entry) => entry.type === TimeTrackerEntryType.Work).reduce((previous, entry) => {
    return previous + ((entry.end || currentDate.value).getTime() - entry.start.getTime());
  }, 0) / 1_000;
});

const formattedWorkTime = computed(() => {
  return parseSeconds(workTime.value);
});

const breakTime = computed(() => {
  return entries.value.filter((entry) => entry.type === TimeTrackerEntryType.Break).reduce((previous, entry) => {
    return previous + ((entry.end || currentDate.value).getTime() - entry.start.getTime());
  }, 0) / 1_000;
});

const formattedBreakTime = computed(() => {
  return parseSeconds(breakTime.value);
});

const sortedEntries = computed(() => {
  return entries.value.slice().sort((a, b) => {
    return a.start > b.start ? -1 : 1;
  });
});

watchEffect(() => {
  emit('updateTimeInformation', {
    workTime: workTime.value,
    breakTime: breakTime.value,
  });
});

async function mergeEntries(entry: TimeTrackerEntry, index: number, mergeType: 'down' | 'up') {
  const deletingEntry = await EntryResource.instance.show(entry.uid);
  if (!deletingEntry) {
    return;
  }

  const refEntry = sortedEntries.value[index + (mergeType === 'down' ? 1 : -1)];
  if (!refEntry) {
    console.error('reference entry not found? (merge down)');
    return;
  }

  const otherEntry = await EntryResource.instance.show(refEntry.uid);
  if (!otherEntry) {
    console.error('other entry not found? (merge down)');
    return;
  }

  let additionalTime: number;
  let updateKey: keyof TimeTrackerEntry;
  if (mergeType === 'down') {
    additionalTime = (deletingEntry.start.getTime() - (otherEntry.end || new Date()).getTime()) / 1_000;
    updateKey = 'end';
  }
  else {
    additionalTime = (otherEntry.start.getTime() - (deletingEntry.end || new Date()).getTime()) / 1_000;
    updateKey = 'start';
  }

  let update: Partial<TimeTrackerEntry> = {
    [updateKey]: deletingEntry[updateKey]!,
  };
  const mergeUpdate = await showMergeDialog(additionalTime, otherEntry, deletingEntry, updateKey);
  if (mergeUpdate === false) {
    return;
  }
  else if (mergeUpdate) {
    update = mergeUpdate;
  }

  await EntryResource.instance.destroy(deletingEntry.uid);
  await EntryResource.instance.update(otherEntry.uid, update);

  showSuccessMessage(t('merge.merged'));
}

function showMergeDialog(
  additionalTime: number,
  to: TimeTrackerEntry,
  from: TimeTrackerEntry,
  updateKey: keyof TimeTrackerEntry,
) {
  if (!settingsStore.mergeSettings.showWarningDialog || additionalTime < settingsStore.mergeSettings.warningTime) {
    return null;
  }

  return new Promise((resolve) => {
    Dialog.create({
      component: TimeTrackerDialogMerge,
      componentProps: {
        additionalTime,
        updateKey,
        from: from,
        to: to,
      },
    })
      .onOk(({ start, end, }) => {
        resolve({
          start,
          end,
        } as Partial<TimeTrackerEntry>);
      })
      .onDismiss(() => resolve(false))
      .onCancel(() => resolve(false));
  });
}

function createEntry(type: TimeTrackerEntryType) {
  const defaultDate = new Date(dateIdentifier.value + ' ' + date.formatDate(new Date(), 'HH:mm:00'));

  tempItem.value = {
    ...EntryResource.instance.getDefaultValues(),
    start: defaultDate,
    end: defaultDate,
    type,
  };
}
</script>

<style lang="scss" scoped>
@reference '../../css/app.scss';

.info-box {
  @apply tw:px-2 tw:py-1 tw:text-sm tw:text-center tw:flex tw:flex-wrap tw:items-center tw:justify-between;
  @apply tw:sm:justify-center tw:content-center tw:bg-stone-950 tw:border-neutral-600 tw:gap-0.5 tw:w-full tw:sm:w-24;
  @apply tw:shrink-0;
}
</style>
