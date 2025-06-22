<template>
  <q-select
    :options="projectStore.projects"
    :label="$t('table.project')"
    class="full-width"
    option-value="uid"
    option-label="name"
    new-value-mode="add"
    map-options
    emit-value
    use-input
    @new-value="addProject"
  />
</template>

<script setup lang="ts">
import { useProjectStore } from 'stores/project';
import ProjectResource from 'src/lib/resources/ProjectResource';
import { catchError } from 'src/lib/functions';

const projectStore = useProjectStore();

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
</script>
