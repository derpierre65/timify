<template>
  <q-dialog ref="dialogRef">
    <q-card class="tw:w-full tw:max-w-[500px]! tw:flex tw:flex-col">
      <q-card-section class="tw:flex tw:gap-1 tw:bg-neutral-950">
        <span>{{ $t('settings.jira_instances.add_projects') }}</span>

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
        <q-list>
          <q-item v-for="project in jiraProjects" :key="project.id">
            <q-item-section side>
              <q-checkbox v-model="selectedProjects" :val="project.id" />
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="project.name"
                :label="$t('settings.jira_instances.add_projects_name')"
                :error="currentProjectNames.includes(project.name.trim().toLowerCase())"
                :error-message="$t('settings.jira_instances.add_projects_name_exists')"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-card-actions align="right" class="tw:bg-neutral-900">
        <q-btn
          :label="$t('global.confirm')"
          color="primary"
          no-caps
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { computed, ref } from 'vue';
import { useProjectStore } from 'stores/project';
import ProjectResource from 'src/lib/resources/ProjectResource';

const props = defineProps<{
  projects: Array<{
    id: string;
    name: string;
    key: string;
  }>;
}>();

const {
  dialogRef,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent();
const projectStore = useProjectStore();

const jiraProjects = ref(props.projects);
const selectedProjects = ref([]);

const projectsWithError = computed(() => {
  return jiraProjects.value.filter((project) => {
    return currentProjectNames.value.includes(project.name.trim().toLowerCase());
  });
});

const currentProjectNames = computed(() => {
  return projectStore.projects.map((project) => project.name.trim().toLowerCase());
});

function confirm() {
  const promises = [];
  for (const project of jiraProjects.value) {
    if (!selectedProjects.value.includes(project.id) || !project.name) {
      continue;
    }
    if (projectsWithError.value.includes(project)) {
      continue;
    }

    promises.push(ProjectResource.instance.store({
      name: project.name,
    }));
  }

  Promise
    .all(promises)
    .then(() => {
      onDialogOK();
    });
}

for (const project of jiraProjects.value) {
  if (!projectsWithError.value.includes(project)) {
    selectedProjects.value.push(project.id);
  }
}
</script>
