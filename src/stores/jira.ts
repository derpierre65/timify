import { defineStore } from 'pinia';
import { ref } from 'vue';

type JiraUser = {
  uid: string | number;
  username: string;
  token: string;
};

type JiraInstance = {
  uid: string | number;
  userId: JiraUser['uid'] | null;
  cloudId: string;
  name: string;
};

const useJiraStore = defineStore('jira', () => {
  const jiraUsers = ref<JiraUser[]>([]);
  const jiraInstances = ref<JiraInstance[]>([]);

  return {
    jiraUsers,
    jiraInstances,
  };
}, {
  persist: true,
});

export {
  type JiraUser,
  type JiraInstance,
  useJiraStore,
};
