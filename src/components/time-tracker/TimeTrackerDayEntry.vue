<template>
  <div class="flex flex-wrap items-center tw:gap-4 tw:min-h-11 tw:hover:bg-neutral-800 q-px-sm">
    <i class="fas flex" :class="entry.type === TimeTrackerEntryType.Work ? 'fa-desktop tw:text-neutral-500' : 'fa-coffee tw:text-green-600'">
      <q-tooltip>{{ $t(`entry_type.${entry.type}`) }}</q-tooltip>
    </i>

    <div class="tw:w-12">
      <template v-if="editMode && editEntry">
        <TimeTrackerTimeInput
          v-model="editEntry.start"
          :label="$t('table.start')"
          :autofocus="editFocus === 'start'"
          dense
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </template>
      <div v-else class="flex column" @click="startEditMode('start')">
        <span class="tw:text-xs">{{ $t('table.start') }}</span>
        <span>{{ startTime }}</span>
      </div>
    </div>

    <div class="tw:w-12">
      <template v-if="editMode && editEntry">
        <TimeTrackerTimeInput
          v-model="editEntry.end"
          :label="$t('table.end')"
          :autofocus="editFocus === 'end'"
          dense
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </template>
      <div v-else class="flex column" @click="startEditMode('end')">
        <span class="tw:text-xs">{{ $t('table.end') }}</span>
        <template v-if="endTime">
          <span>{{ endTime }}</span>
        </template>
        <i v-else class="fas fa-ellipsis-h">
          <q-tooltip>{{ $t('table.end_pending') }}</q-tooltip>
        </i>
      </div>
    </div>

    <div class="flex column tw:w-16">
      <span class="tw:text-xs">{{ $t('table.total') }}</span>
      <span>{{ formattedTotalTime }}</span>
    </div>

    <div class="flex column">
      <span class="tw:text-xs">{{ $t('table.project') }}</span>
      <span>soon</span>
    </div>

    <div class="flex column">
      <template v-if="editEntry">
        <q-input
          v-model="editEntry.project_code"
          :label="$t('table.project_code')"
          :autofocus="editFocus === 'project_code'"
          dense
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </template>
      <div v-else class="flex column cursor-pointer" @click="startEditMode('project_code')">
        <span class="tw:text-xs">{{ $t('table.project_code') }}</span>
        <span>{{ entry.project_code || '-' }}</span>
      </div>
    </div>

    <div v-if="editMode" class="tw:flex-initial">
      <div class="tw:flex tw:border tw:rounded tw:p-1 tw:bg-neutral-800 tw:border-neutral-600 tw:gap-1">
        <q-btn
          class="tw:bg-green-900! tw:text-gray-400"
          icon="fas fa-check"
          size="sm"
          square
          dense
          @click="saveEdit"
        >
          <q-tooltip>
            {{ $t('global.save') }}
          </q-tooltip>
        </q-btn>
        <q-btn
          class="tw:bg-neutral-700! tw:text-gray-400"
          icon="fas fa-times"
          size="sm"
          dense
          @click="cancelEdit"
        >
          <q-tooltip>
            {{ $t('global.cancel') }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-space />

    <div class="flex items-center time-tracker-day-options">
      <q-btn
        v-if="canMergeUpwards"
        icon="fas fa-arrow-up"
        size="sm"
        round
        @click="$emit('merge', 'up')"
      >
        <q-tooltip>{{ $t('table.actions.merge_up') }}</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canMergeDownwards"
        icon="fas fa-arrow-down"
        size="sm"
        round
        @click="$emit('merge', 'down')"
      >
        <q-tooltip>{{ $t('table.actions.merge_down') }}</q-tooltip>
      </q-btn>

      <q-btn
        icon="fas fa-ellipsis-h"
        size="sm"
        round
      >
        <q-menu>
          <q-list>
            <q-item v-close-popup clickable @click="toggleEntryType">
              <q-item-section side>
                <q-item-label>
                  <q-icon :name="entry.type === TimeTrackerEntryType.Work ? 'fa fa-coffee tw:text-green-600' : 'fas fa-desktop'" />
                </q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{
                    $t(entry.type === TimeTrackerEntryType.Work
                      ? 'table.actions.change_to_break'
                      : 'table.actions.change_to_work')
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="deleteEntry">
              <q-item-section side>
                <q-item-label>
                  <q-icon name="fas fa-trash tw:text-red-400" />
                </q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('global.delete') }}</q-item-label>
              </q-item-section>
            </q-item>
            <!-- todo add jira push -->
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimeTrackerEntry, TimeTrackerEntryType } from 'stores/timeTracker';
import { computed, inject, ref, Ref } from 'vue';
import { date, Loading } from 'quasar';
import { formatHourAndMinutes } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';
import EntryResource from 'src/lib/resources/EntryResource';
import { catchError } from 'src/lib/functions';
import TimeTrackerTimeInput from 'components/time-tracker/TimeTrackerTimeInput.vue';
import { showErrorMessage } from 'src/lib/ui';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
  entry: TimeTrackerEntry;
  canMergeUpwards?: boolean;
  canMergeDownwards?: boolean;
}>();

const emit = defineEmits<{
  merge: [type: 'down' | 'up'];
  cancelEdit: [];
}>();

const { t, } = useTranslation();
const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const editEntry = ref<TimeTrackerEntry | null>(null);
const editFocus = ref<keyof TimeTrackerEntry>('start');
const editMode = ref(false);

const startTime = computed(() => {
  return date.formatDate(props.entry.start, 'HH:mm');
});

const endTime = computed(() => {
  if (!props.entry.end) {
    return null;
  }

  return date.formatDate(props.entry.end, 'HH:mm');
});

const totalTime = computed(() => {
  const end = editEntry.value?.end || props.entry.end || currentDate.value;

  return (end.getTime() - (editEntry.value?.start || props.entry.start).getTime()) / 1_000;
});

const formattedTotalTime = computed(() => {
  return formatHourAndMinutes(totalTime.value);
});

function startEditMode(focusField: keyof TimeTrackerEntry) {
  editEntry.value = Object.assign(Object.create(null), props.entry);
  editFocus.value = focusField;
  editMode.value = true;
}

function cancelEdit() {
  editMode.value = false;
  editEntry.value = null;

  emit('cancelEdit');
}

function saveEdit() {
  if (!editEntry.value || !editEntry.value.start) {
    return;
  }

  if (editEntry.value.start > (editEntry.value.end || currentDate.value)) {
    showErrorMessage(t('error.start_must_before_end'));
    return;
  }

  Loading.show();
  if (!props.entry.uid) {
    EntryResource.instance
      .store({
        ...props.entry,
        ...editEntry.value,
      })
      .then(() => {
        cancelEdit();
      })
      .catch(catchError)
      .finally(() => Loading.hide());
    return;
  }

  EntryResource.instance
    .update(props.entry.uid, {
      start: editEntry.value.start,
      end: editEntry.value.end,
      project: editEntry.value.project,
      project_code: editEntry.value.project_code,
    })
    .then(() => {
      cancelEdit();
    })
    .catch(catchError)
    .finally(() => Loading.hide());
}

function deleteEntry() {
  Loading.show();

  EntryResource.instance
    .destroy(props.entry.uid)
    .catch(catchError)
    .finally(() => Loading.hide());
}

function toggleEntryType() {
  Loading.show();

  EntryResource.instance
    .update(props.entry.uid, {
      type: props.entry.type === TimeTrackerEntryType.Work ? TimeTrackerEntryType.Break : TimeTrackerEntryType.Work,
    })
    .catch(catchError)
    .finally(() => Loading.hide());
}

if (!props.entry.uid) {
  startEditMode('start');
}
</script>
