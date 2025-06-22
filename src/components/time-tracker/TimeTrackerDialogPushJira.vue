<template>
  <q-dialog ref="dialogRef">
    <q-card class="tw:w-full tw:max-w-[800px]! tw:flex tw:flex-col">
      <q-card-section class="tw:flex tw:gap-1 tw:bg-neutral-950">
        <span>{{ $t('push_to_jira.title') }}</span>

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
          <q-toggle
            v-model="useSingleComment"
            :label="$t('push_to_jira.use_single_comment')"
          />

          <q-input
            v-if="useSingleComment"
            v-model="comment"
            class="tw:col-span-5"
            :label="$t('push_to_jira.comment_all_issues')"
            type="textarea"
            autogrow
            dense
          />

          <q-list bordered separator>
            <q-item
              v-for="(pushEntry, index) in pushToInstances"
              :key="pushEntry.uid"
              class="q-pr-sm"
            >
              <q-item-section
                v-if="pushEntry.error || pushEntry.sent || pushEntry.invalid || pushEntry.loading"
                side
              >
                <q-circular-progress
                  v-if="pushEntry.loading"
                  size="sm"
                  color="primary"
                  indeterminate
                />
                <q-icon v-else-if="pushEntry.invalid" class="fas fa-warning" color="red">
                  <q-tooltip>{{ pushEntry.invalid }}</q-tooltip>
                </q-icon>
                <q-icon v-else-if="pushEntry.error" class="fas fa-xmark" color="red">
                  <q-tooltip>{{ pushEntry.error }}</q-tooltip>
                </q-icon>
                <q-icon v-else class="fas fa-check" color="green" />
              </q-item-section>

              <q-item-section class="tw:grid! tw:sm:grid-cols-2 tw:md:grid-cols-8 tw:gap-4 items-center">
                <q-select
                  v-model="pushEntry.cloudId"
                  :disable="pushEntry.sent || pushEntry.loading"
                  :label="$t('push_to_jira.instance')"
                  :options="selectableInstances"
                  option-label="name"
                  option-value="cloudId"
                  class="tw:md:col-span-4"
                  dense
                  emit-value
                  map-options
                  clearable
                  @update:model-value="validateEntry(pushEntry)"
                />

                <q-input
                  v-model="pushEntry.issueId"
                  :disable="pushEntry.sent || pushEntry.loading"
                  :label="$t('push_to_jira.issue_id')"
                  dense
                  @change="validateEntry(pushEntry)"
                />

                <TimeTrackerTimeInput
                  v-model="pushEntry.start"
                  :label="$t('table.start')"
                  :disable="pushEntry.sent || pushEntry.loading"
                  dense
                  @change="validateEntry(pushEntry)"
                />

                <TimeTrackerTimeInput
                  v-model="pushEntry.end"
                  :label="$t('table.end')"
                  :disable="pushEntry.sent || pushEntry.loading"
                  dense
                  @change="validateEntry(pushEntry)"
                />

                <div class="flex column">
                  <span class="tw:text-xs">{{ $t('table.total') }}</span>
                  <span>{{ formatHourAndMinutes((pushEntry.end.getTime() - pushEntry.start.getTime()) / 1_000) }}</span>
                </div>

                <q-input
                  v-if="!useSingleComment"
                  v-model="pushEntry.comment"
                  :disable="pushEntry.sent || pushEntry.loading"
                  class="tw:col-span-7"
                  :label="$t('push_to_jira.comment')"
                  type="textarea"
                  autogrow
                  dense
                />
              </q-item-section>

              <q-item-section class="tw:pl-0! tw:flex-row! tw:items-center!" side>
                <q-btn
                  v-if="pushEntry.end.getTime() - pushEntry.start.getTime() < 60_000"
                  icon="fas fa-wand-magic-sparkles"
                  color="purple"
                  size="sm"
                  round
                  flat
                  @click="adjustStart(pushEntry)"
                >
                  <q-tooltip>{{ $t('push_to_jira.adjust_start') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="pushToInstances.length > 1 && !pushEntry.sent && !pushEntry.loading"
                  icon="fas fa-trash"
                  color="negative"
                  size="sm"
                  round
                  flat
                  @click="pushToInstances.splice(index, 1)"
                >
                  <q-tooltip>{{ $t('global.delete') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn color="primary" icon="fas fa-plus" @click="addJiraIssue()" />
        </q-card-section>
      </div>

      <q-card-actions class="tw:bg-neutral-950" align="right">
        <q-btn
          :label="$t('push_to_jira.title')"
          :disable="!canPush"
          color="green"
          no-caps
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date, uid, useDialogPluginComponent } from 'quasar';
import { TimeTrackerEntry } from 'stores/timeTracker';
import { computed, ref } from 'vue';
import { useJiraStore } from 'stores/jira';
import { useProjectStore } from 'stores/project';
import TimeTrackerTimeInput from 'components/time-tracker/TimeTrackerTimeInput.vue';
import { formatHourAndMinutes } from 'src/lib/date';
import { useTranslation } from 'i18next-vue';
import { confirmAction, showSuccessMessage } from 'src/lib/ui';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { jiraRequest } from 'src/lib/jira';

const props = defineProps<{
  entry: TimeTrackerEntry;
}>();

const projectStore = useProjectStore();
const jiraStore = useJiraStore();
const { t, } = useTranslation();
const {
  dialogRef,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent();

const pushToInstances = ref<Array<{
  uid: string;
  cloudId: string | null;
  issueId: string;
  comment: string;
  start: Date;
  end: Date;
  sent: boolean;
  invalid: boolean | string;
  error: boolean | string;
  loading: boolean;
}>>([]);
const useSingleComment = ref(true);
const comment = ref('');

const selectableInstances = computed(() => {
  return jiraStore.jiraInstances.filter((instance) => {
    return instance.cloudId && instance.userId;
  });
});

const canPush = computed(() => {
  for (const entry of pushToInstances.value) {
    if (entry.sent) {
      continue;
    }

    if (!entry.invalid) {
      return true;
    }
  }

  return false;
});

const autoDetectedJiraInstance = computed(() => {
  const project = projectStore.projects.find((project) => project.uid === props.entry.project);
  if (!project) {
    return null;
  }

  const projectName = project.name.trim().toLowerCase();
  for (const instance of selectableInstances.value) {
    if (!project) {
      continue;
    }
    if (instance.name.trim().toLowerCase() === projectName) {
      return instance;
    }
  }

  return null;
});

function addJiraIssue(cloudId: string | null = '', issueId = '') {
  pushToInstances.value.push({
    uid: uid(),
    comment: '',
    start: new Date(props.entry.start),
    end: new Date(props.entry.end!),
    cloudId: cloudId || autoDetectedJiraInstance.value?.cloudId || null,
    issueId,
    loading: false,
    invalid: false,
    sent: false,
    error: false,
  });
  validateEntry(pushToInstances.value[pushToInstances.value.length - 1]!);
}

function validateEntry(entry: typeof pushToInstances.value[0]) {
  if (!entry.cloudId) {
    entry.invalid = t('push_to_jira.errors.no_instance');
    return false;
  }

  if (!entry.issueId) {
    entry.invalid = t('push_to_jira.errors.no_issue_id');
    return false;
  }

  if (!entry.start) {
    entry.invalid = t('push_to_jira.errors.no_start');
    return false;
  }

  if (!entry.end) {
    entry.invalid = t('push_to_jira.errors.no_end');
    return false;
  }

  if (entry.start > entry.end) {
    entry.invalid = t('error.start_must_before_end');
    return false;
  }

  const duration = entry.end.getTime() - entry.start.getTime();
  if (duration < 60_000) {
    entry.invalid = t('push_to_jira.errors.minimum_duration');
    return false;
  }

  entry.invalid = false;
  return true;
}

async function confirm() {
  const invalidEntries = [];

  for (const entry of pushToInstances.value) {
    if (entry.sent) {
      return;
    }

    const validated = validateEntry(entry);
    if (!validated) {
      invalidEntries.push(entry);
    }
  }

  if (invalidEntries.length && !await confirmAction(t('push_to_jira.push_confirm'))) {
    return;
  }

  for (const entry of pushToInstances.value) {
    if (entry.sent || entry.invalid) {
      continue;
    }

    const finalComment = useSingleComment.value ? comment.value : entry.comment;
    const lines = finalComment.replace(/^\n+|\n+$/g, '').split('\n');
    const jiraDocContent = [];
    for (const [ index, line, ] of lines.entries()) {
      if (index === 0 && !line.length) {
        continue;
      }

      if (line.length) {
        jiraDocContent.push({
          text: line,
          type: 'text',
        });
      }

      if (index !== lines.length - 1) {
        jiraDocContent.push({
          type: 'hardBreak',
        });
      }
    }

    const config = {
      method: 'POST',
      params: {
        notifyUsers: true,
        adjustEstimate: 'auto',
      },
      data: {
        comment: {
          content: [
            {
              content: jiraDocContent,
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        started: date.formatDate(entry.start, 'YYYY-MM-DD\THH:mm:ss.SSSZ').replace(/\+(\d+):(\d+)/, '+$1$2'),
        timeSpentSeconds: Math.ceil((entry.end.getTime() - entry.start.getTime()) / 1_000),
      },
    } as AxiosRequestConfig;

    const jiraInstance = selectableInstances.value.find((instance) => instance.cloudId === entry.cloudId);
    if (!jiraInstance) {
      entry.invalid = 'Can\'t find Jira Instance.';
      continue;
    }

    entry.error = false;

    try {
      entry.loading = true;
      await jiraRequest(`rest/api/3/issue/${entry.issueId}/worklog`, jiraInstance, config);
      entry.sent = true;
    }
    catch (error) {
      let errorMessage = '';

      errorMessage ||= (error as AxiosResponse).response?.data?.errorMessages?.[0];
      entry.error = errorMessage || t('error.unknown');
      console.error(error);
    }
    entry.loading = false;
  }

  for (const entry of pushToInstances.value) {
    if (!entry.sent) {
      return;
    }
  }

  showSuccessMessage(t('push_to_jira.success'));
  onDialogOK();
}

function adjustStart(entry: typeof pushToInstances.value[0]) {
  const diff = 60_000 - (entry.end.getTime() - entry.start.getTime());
  entry.start = new Date(entry.start.getTime() - diff);
  validateEntry(entry);
}

(() => {
  const possibleEntryIds = props.entry.project_code.split(',').map((code) => code.trim()).filter((code) => code);

  const foundIssueIds: Array<{
    id: string;
    projectName: string;
  }> = [];
  for (const possibleEntryId of possibleEntryIds) {
    for (const match of possibleEntryId.matchAll(/([A-Z]+)-(\d+)/g)) {
      foundIssueIds.push({
        id: match[0],
        projectName: match[1]!,
      });
    }
  }

  const potentialInstances = Object.create(null);

  if (!autoDetectedJiraInstance.value) {
    for (const instance of selectableInstances.value) {
      const potentialProjectName = instance.name
        .split(' ')
        .map((name) => name.replace(/[^a-zA-Z0-9]+/, '').trim().substring(0, 1))
        .join('');
      potentialInstances[potentialProjectName] = instance.cloudId;
    }
  }

  for (const foundIssue of foundIssueIds) {
    const cloudId = autoDetectedJiraInstance.value?.cloudId || potentialInstances[foundIssue.projectName] || null;
    addJiraIssue(cloudId, foundIssue.id);
  }

  if (!pushToInstances.value.length) {
    addJiraIssue();
  }
})();
</script>
