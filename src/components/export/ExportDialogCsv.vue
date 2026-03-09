<template>
  <q-dialog ref="dialogRef">
    <q-card class="tw:w-full tw:max-w-[800px]! tw:flex tw:flex-col">
      <q-card-section class="tw:flex tw:gap-1 tw:bg-neutral-950">
        <span>{{ $t('export.button') }}</span>
      </q-card-section>

      <q-card-section class="tw:flex-auto q-gutter-y-lg">
        <div class="q-gutter-y-md">
          <div>
            <strong>{{ $t('export.settings.title') }}</strong>
          </div>
          <q-toggle v-model="options.ignoreBreaks" :label="$t('export.settings.ignore_breaks')" dense />

          <q-input v-model="options.dateFormat" :label="$t('export.settings.date_format')" dense />
        </div>

        <div>
          <div class="q-mb-md">
            <strong>{{ $t('export.csv.fields') }}</strong>
          </div>

          <div v-for="(value, field) in exportFields" :key="field" class="flex tw:gap-2 items-center">
            <q-toggle
              v-model="exportFields[field]"
              dense
            />

            <q-input
              v-model="exportFieldNames[field]"
              :disable="!exportFields[field]"
              :label="exportFieldDefaultNames[field]"
              class="tw:lg:col-span-4 tw:flex-auto"
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="tw:bg-neutral-950" align="right">
        <q-btn
          :label="$t('export.button')"
          icon="fas fa-download"
          color="primary"
          no-caps
          @click="exportCsv"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { TimeTrackerEntryType, useTimeTrackerStore } from 'stores/timeTracker';
import { useSettingsStore } from 'stores/settings';
import { date, useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { createCsv, downloadCsv } from 'src/lib/csv';
import { useProjectStore } from 'stores/project';
import { formatHourAndMinutes } from 'src/lib/date';
import { useTranslation } from 'i18next-vue';

const timeTrackerStore = useTimeTrackerStore();
const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const { t, } = useTranslation();

const {
  dialogRef,
} = useDialogPluginComponent();

const options = ref({
  ignoreBreaks: false,
  dateFormat: settingsStore.dateFormat + ' ' + settingsStore.timeFormat,
});

const exportFieldDefaultNames = ref({
  uid: t('export.fields.id'),
  project: t('table.project'),
  project_code: t('table.project_code'),
  start: t('table.start'),
  end: t('table.end'),
  total: t('table.total'),
});

const exportFields = ref({
  uid: false,
  project: true,
  project_code: true,
  start: true,
  end: true,
  total: true,
});

type ExportField = keyof typeof exportFields.value;

const exportFieldNames = ref({
  ...exportFieldDefaultNames.value,
});

async function exportCsv() {
  const activeFields = (Object.keys(exportFields.value) as ExportField[])
    .filter((field) => exportFields.value[field]);

  const headers = activeFields.map((field) => exportFieldNames.value[field]);
  const entries = [];

  for (const entry of timeTrackerStore.entries) {
    if (!entry.end) {
      continue;
    }

    if (options.value.ignoreBreaks && entry.type === TimeTrackerEntryType.Break) {
      continue;
    }

    let projectName = '';
    if (entry.project) {
      projectName = (await projectStore.find(entry.project)).name;
    }

    const fieldValues: Record<ExportField, string | number> = {
      uid: entry.uid,
      project: projectName,
      project_code: entry.project_code || '',
      start: date.formatDate(entry.start, options.value.dateFormat),
      end: date.formatDate(entry.end, options.value.dateFormat),
      total: formatHourAndMinutes((entry.end - entry.start) / 1_000),
    };

    entries.push(activeFields.map((field) => fieldValues[field]));
  }

  downloadCsv('timify-timetracker-entries', createCsv([
    headers,
    ...entries,
  ]));
}
</script>
