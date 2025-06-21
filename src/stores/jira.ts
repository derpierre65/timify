import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios, { AxiosRequestConfig } from 'axios';

type JiraUser = {
  uid: string | number;
  username: string;
  token: string;
};

type JiraInstance = {
  userId: JiraUser['uid'];
  cloudId: string;
  name: string;
};

const useJiraStore = defineStore('jira', () => {
  const jiraUsers = ref<JiraUser[]>([]);
  const jiraInstances = ref<Record<string, JiraInstance>>({});

  function executeJiraRequest(url: string, instance: JiraInstance, config: AxiosRequestConfig) {
    if (!instance.userId) {
      return Promise.reject(new Error('No user selected.'));
    }

    const user = jiraUsers.value.find((user) => user.uid === instance.userId);
    if (!user) {
      return Promise.reject(new Error('User not found.'));
    }

    config.headers ??= {};
    config.auth ??= {
      username: user.username,
      password: user.token,
    };

    url = `${instance.cloudId}/` + url;

    config.headers['X-Atlassian-Token'] = 'no-check';
    config.headers['User-Agent'] = 'jira-timetracker';

    return axios.request({
      url,
      ...config,
    });
  }

  return {
    jiraUsers,
    jiraInstances,
    executeJiraRequest,
  };
}, {
  persist: true,
});

export {
  useJiraStore,
};
