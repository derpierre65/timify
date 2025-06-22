import { type JiraInstance, useJiraStore } from 'stores/jira';
import axios, { type AxiosRequestConfig } from 'axios';

function jiraRequest(url: string, instance: JiraInstance, config: AxiosRequestConfig = {}) {
  if (!instance.userId) {
    return Promise.reject(new Error('No user selected.'));
  }

  const jiraStore = useJiraStore();

  const user = jiraStore.jiraUsers.find((user) => user.uid === instance.userId);
  if (!user) {
    return Promise.reject(new Error('User not found.'));
  }

  config.headers ??= {};
  config.auth ??= {
    username: user.username,
    password: user.token,
  };

  config.method ??= 'GET';

  url = `${instance.cloudId}/` + url;

  config.headers['X-Atlassian-Token'] = 'no-check';
  config.headers['User-Agent'] = 'timify';

  return axios.request({
    url,
    ...config,
  });
}

export {
  jiraRequest,
};
