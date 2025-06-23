<template>
  <div class="flex flex-wrap items-center tw:gap-4 tw:min-h-12 tw:hover:bg-neutral-800 q-px-sm">
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
      <div
        v-else
        :class="{'cursor-pointer': !editMode}"
        class="flex column"
        @click="startEditMode('start')"
      >
        <span class="tw:text-xs">{{ $t('table.start') }}</span>
        <span>{{ startTime }}</span>
      </div>
    </div>

    <div class="tw:w-12">
      <template v-if="editMode && editEntry && editEntry.end">
        <TimeTrackerTimeInput
          v-model="editEntry.end"
          :label="$t('table.end')"
          :autofocus="editFocus === 'end'"
          dense
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </template>
      <div
        v-else
        :class="{'cursor-pointer': !editMode}"
        class="flex column"
        @click="startEditMode('end')"
      >
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

    <div
      class="flex column"
      :class="!editMode ? 'cursor-pointer tw:w-32' : 'tw:w-64'"
      @click="startEditMode('project')"
    >
      <template v-if="editEntry">
        <q-select
          v-model="editEntry.project"
          :options="projectStore.projects"
          :label="$t('table.project')"
          class="full-width"
          option-value="uid"
          option-label="name"
          new-value-mode="add"
          map-options
          emit-value
          clearable
          dense
          use-input
          @new-value="addProject"
        />
      </template>
      <template v-else>
        <span class="tw:text-xs">{{ $t('table.project') }}</span>
        <div class="full-width flex items-center">
          <q-badge
            v-if="project"
            class="overflow-hidden ellipsis tw:max-w-[100%] inline-block"
            :style="{backgroundColor: project.color, color: projectTextColor}"
            :label="project.name"
          >
            <q-tooltip v-if="project && project.name.length > 18">
              {{ project.name }}
            </q-tooltip>
          </q-badge>
          <span v-else>-</span>
        </div>
      </template>
    </div>

    <div
      class="flex column"
      :class="{'cursor-pointer': !editMode}"
      @click="startEditMode('project_code')"
    >
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
      <template v-else>
        <span class="tw:text-xs">{{ $t('table.project_code') }}</span>
        <span>{{ entry.project_code || '-' }}</span>
      </template>
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
        v-if="canMergeUpwards && $q.screen.gt.md"
        icon="fas fa-arrow-up"
        size="sm"
        round
        @click="$emit('merge', 'up')"
      >
        <q-tooltip>{{ $t('table.actions.merge_up') }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="canMergeDownwards && $q.screen.gt.md"
        icon="fas fa-arrow-down"
        size="sm"
        round
        @click="$emit('merge', 'down')"
      >
        <q-tooltip>{{ $t('table.actions.merge_down') }}</q-tooltip>
      </q-btn>

      <template
        v-if="!editMode && $q.screen.gt.md && entry.type === TimeTrackerEntryType.Work &&
          !entry.pushedToJira&& entry.end && jiraStore.isConfigured"
      >
        <q-btn
          icon="fab fa-jira"
          color="blue"
          size="sm"
          round
          flat
          @click="pushToJira"
        >
          <q-tooltip>{{ $t('push_to_jira.title') }}</q-tooltip>
        </q-btn>
      </template>

      <q-btn
        icon="fas fa-ellipsis-h"
        size="sm"
        round
      >
        <q-menu>
          <q-list>
            <template v-if="!$q.screen.gt.md">
              <q-item v-close-popup clickable @click="pushToJira">
                <q-item-section side>
                  <q-item-label>
                    <q-icon name="fab fa-jira" color="blue" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ $t('push_to_jira.title') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item v-if="canMergeUpwards" v-close-popup clickable @click="$emit('merge', 'up')">
                <q-item-section side>
                  <q-item-label>
                    <q-icon name="fas fa-arrow-up" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ $t('table.actions.merge_up') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="canMergeDownwards" v-close-popup clickable @click="$emit('merge', 'down')">
                <q-item-section side>
                  <q-item-label>
                    <q-icon name="fas fa-arrow-down" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ $t('table.actions.merge_down') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
            </template>
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
                  <q-icon name="fas fa-trash" color="negative" />
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
import { date, Dialog, Loading } from 'quasar';
import { formatHourAndMinutes } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';
import EntryResource from 'src/lib/resources/EntryResource';
import { catchError } from 'src/lib/functions';
import TimeTrackerTimeInput from 'components/time-tracker/TimeTrackerTimeInput.vue';
import { showErrorMessage } from 'src/lib/ui';
import { useTranslation } from 'i18next-vue';
import { useProjectStore } from 'stores/project';
import ProjectResource from 'src/lib/resources/ProjectResource';
import { getAccessibleTextColor } from 'src/lib/color';
import { useJiraStore } from 'stores/jira';
import TimeTrackerDialogPushJira from 'components/time-tracker/TimeTrackerDialogPushJira.vue';

const props = defineProps<{
  entry: TimeTrackerEntry;
  canMergeUpwards?: boolean;
  canMergeDownwards?: boolean;
}>();

const emit = defineEmits<{
  merge: [type: 'down' | 'up'];
  cancelEdit: [];
}>();

const projectStore = useProjectStore();
const jiraStore = useJiraStore();
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

const project = computed(() => {
  if (!props.entry.project) {
    return null;
  }

  return projectStore.projects.find((project) => project.uid === props.entry.project);
});

const projectTextColor = computed(() => {
  if (!project.value) {
    return '#000000';
  }

  return getAccessibleTextColor(project.value.color);
});

function startEditMode(focusField: keyof TimeTrackerEntry) {
  if (editMode.value) {
    return;
  }

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

function addProject(value: string, done) {
  ProjectResource.instance
    .store({
      name: value,
    })
    .then((data) => {
      done(data);
    })
    .catch(catchError);
}

function pushToJira() {
  Dialog.create({
    component: TimeTrackerDialogPushJira,
    componentProps: {
      entry: props.entry,
    },
  }).onOk(() => {
    EntryResource.instance.update(props.entry.uid, {
      pushedToJira: true,
    });
  });
}

if (!props.entry.uid) {
  startEditMode('start');
}
</script>
