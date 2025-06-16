import {defineStore} from 'pinia';
import {ref} from "vue";
import axios, {AxiosRequestConfig} from "axios";

type JiraUser = {
    username: string;
    token: string;
    cloudIds: Record<string, string>;
};

const useJiraStore = defineStore('jira', () => {
    const jiraUsers = ref<JiraUser[]>([]);

    function executeJiraRequest(url: string, id: string, user: JiraUser, config: AxiosRequestConfig) {
        config.headers ??= {};
        config.auth ??= {
            username: user.username,
            password: user.token,
        };

        url = `${user.cloudIds[id]}/` + url;

        config.headers['X-Atlassian-Token'] = 'no-check';
        config.headers['User-Agent'] = 'jira-timetracker';

        return axios.request({
            url,
            ...config,
        });
    }

    return {
        jiraUsers,
        executeJiraRequest,
    }
}, {
    persist: true,
});

export {
    useJiraStore
};