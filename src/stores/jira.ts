import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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

  const isConfigured = computed(() => {
    return jiraInstances.value.find((instance) => {
      if (!instance.cloudId || !instance.userId) {
        return false;
      }

      return jiraUsers.value.find((user) => {
        if (user.uid !== instance.userId) {
          return false;
        }

        return user.username && user.token;
      });
    });
  });

  return {
    isConfigured,
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
