<template>
  <div class="q-gutter-y-md">
    <AppCard :title="$t('settings.jira_users.title')" section-class="q-gutter-y-sm">
      <template v-if="canCreateNewUser" #buttons>
        <q-btn icon="fas fa-plus" color="primary" @click="addUser" />
      </template>

      <AppCard
        v-for="(user, index) in jiraStore.jiraUsers"
        :key="user.uid"
        section-class="q-gutter-y-md"
        bordered
      >
        <template #title>
          {{ user.username || $t('settings.jira_users.no_username') }}
        </template>
        <template #buttons>
          <q-btn
            icon="fas fa-trash"
            color="negative"
            @click="removeUser(index)"
          />
        </template>

        <q-input
          v-model="user.username"
          :label="$t('settings.jira_users.username')"
          dense
        />

        <q-input
          v-model="user.token"
          :label="$t('settings.jira_users.token')"
          type="password"
          :error="false"
          dense
        >
          <template #hint>
            <i18next :translation="$t('settings.jira_users.token_hint')">
              <template #here>
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  rel="noopener noreferrer"
                  class="link"
                  target="_blank"
                >{{ $t('settings.jira_users.token_hint_here') }}</a>
              </template>
            </i18next>
          </template>
        </q-input>
      </AppCard>
    </AppCard>

    <AppCard :title="$t('settings.jira_instances.title')" section-class="q-gutter-y-md">
      <template v-if="canCreateNewInstance" #buttons>
        <q-btn icon="fas fa-plus" color="primary" @click="addInstance" />
      </template>

      <AppCard
        v-for="(instance, index) in jiraStore.jiraInstances"
        :key="instance.uid"
        section-class="q-gutter-y-md"
        bordered
      >
        <template #title>
          {{ instance.name || $t('settings.jira_instances.no_name') }}
        </template>
        <template #buttons>
          <q-btn
            icon="fas fa-trash"
            color="negative"
            @click="removeInstance(index)"
          />
        </template>

        <pre>{{ instance }}</pre>

        <q-input
          v-model="instance.name"
          :label="$t('settings.jira_instances.name')"
          dense
        />

        <q-input
          v-model="instance.cloudId"
          :label="$t('settings.jira_instances.cloud_id')"
          dense
        />

        <q-select
          v-model="instance.userId"
          :label="$t('settings.jira_instances.user')"
          :options="selectableUsers"
          option-label="username"
          option-value="uid"
          dense
          emit-value
          map-options
          clearable
        >
          <template #after>
            <q-btn
              :disable="!(instance.userId && instance.cloudId)"
              :label="$t('settings.jira_instances.test_connection')"
              color="primary"
              no-caps
              @click="testConnection(instance)"
            >
              <q-tooltip v-if="!(instance.userId && instance.cloudId)">
                {{ $t('settings.jira_instances.test_connection_disabled') }}
              </q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </AppCard>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import AppCard from 'components/AppCard.vue';
import { JiraInstance, useJiraStore } from 'stores/jira';
import { Loading, uid } from 'quasar';
import { computed } from 'vue';
import { jiraRequest } from 'src/lib/jira';
import { useTranslation } from 'i18next-vue';
import { showErrorMessage, showSuccessMessage } from 'src/lib/ui';

const { t, } = useTranslation();
const jiraStore = useJiraStore();

const canCreateNewUser = computed(() => {
  return !jiraStore.jiraUsers.find((user) => !user.username || !user.token);
});

const canCreateNewInstance = computed(() => {
  if (!jiraStore.jiraUsers.find((user) => user.username && user.token)) {
    return false;
  }

  return !jiraStore.jiraInstances.find((instance) => {
    return !instance.cloudId || !instance.name || !instance.userId;
  });
});

const selectableUsers = computed(() => {
  return jiraStore.jiraUsers.filter((user) => user.username && user.token);
});

function addUser() {
  jiraStore.jiraUsers.push({
    uid: uid(),
    token: '',
    username: '',
  });
}
function addInstance() {
  jiraStore.jiraInstances.push({
    uid: uid(),
    userId: null,
    name: '',
    cloudId: '',
  });
}

function removeUser(index: number) {
  jiraStore.jiraUsers.splice(index, 1);
}
function removeInstance(index: number) {
  jiraStore.jiraInstances.splice(index, 1);
}

function testConnection(instance: JiraInstance) {
  Loading.show({
    message: t('settings.jira_instances.test_connection_progress'),
    group: 'testConnection',
  });

  jiraRequest('rest/api/3/project/search', instance, {
    params: {
      maxResults: 100,
    },
  })
    .then(({ data, }) => {
      showSuccessMessage(t('settings.jira_instances.test_connection_success', {
        count: data.total,
      }));
    })
    .catch(() => {
      // improve errorhandling?
      showErrorMessage(t('settings.jira_instances.test_connection_failed'));
    })
    .finally(() => Loading.hide('testConnection'));
}

</script>
