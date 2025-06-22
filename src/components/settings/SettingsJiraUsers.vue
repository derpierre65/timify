<template>
  <div class="q-gutter-y-md">
    <AppCard title="Users" section-class="q-gutter-y-sm">
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
  </div>
</template>

<script setup lang="ts">
import AppCard from 'components/AppCard.vue';
import { useJiraStore } from 'stores/jira';
import { uid } from 'quasar';
import { computed } from 'vue';

const jiraStore = useJiraStore();

const canCreateNewUser = computed(() => {
  return !jiraStore.jiraUsers.find((user) => !user.username || !user.token);
});

function addUser() {
  jiraStore.jiraUsers.push({
    uid: uid(),
    token: '',
    username: '',
  });
}

function removeUser(index: number) {
  jiraStore.jiraUsers.splice(index, 1);
}
</script>
