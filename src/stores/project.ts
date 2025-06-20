import { defineStore } from 'pinia';
import { ref } from 'vue';
import { StoreApiStoreFunctions } from 'src/lib/resources/interfaces/PiniaStoreApiInterface';
import { useCrudStore } from 'src/composables/store/crudStore';

type Project = {
  uid: string | number;
  name: string;
  color: string;
};

const useProjectStore = defineStore('project', () => {
  const projectStore = ref<Project[]>([]);
  const projects = ref<Project[]>([]);
  const crudFunctions = useCrudStore(projectStore);

  return {
    projects,
    projectStore,
    ...crudFunctions,
  } satisfies StoreApiStoreFunctions<Project> & Record<string, unknown>;
}, {
  persist: {
    pick: [ 'projectStore', ],
  },
});

export {
  type Project,
  useProjectStore,
};
