<template>
  <div class="full-width">
    <q-breadcrumbs class="tw:bg-neutral-900 q-pa-sm">
      <q-breadcrumbs-el :to="{name: 'index'}" :label="$t('pages.home')" />
      <q-breadcrumbs-el :label="$t('pages.settings')" />
    </q-breadcrumbs>

    <q-card class="q-ma-md tw:flex-auto tw:flex tw:flex-col no-shadow">
      <div class="tw:flex tw:flex-col tw:xl:flex-row tw:flex-auto">
        <div class="tw:bg-neutral-900 tw:xl:min-w-[265px]">
          <q-list class="tw:bg-neutral-800 q-ma-sm tw:sticky tw:top-12 q-pa-sm">
            <q-item
              v-for="tabItem in tabs"
              :key="tabItem.name"
              :active="tabItem.name === tab"
              active-class="tw:bg-primary/20"
              clickable
            >
              <q-item-section side>
                <q-icon :name="tabItem.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('settings.tabs.' + tabItem.name) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-separator vertical />

        <div class="tw:w-full relative-position q-pa-md">
          <component :is="activeTab.component" v-if="activeTab" />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SettingsJiraUsers from 'components/settings/SettingsJiraUsers.vue';

const tab = ref('jira_users');
const tabs = [
  {
    name: 'jira_users',
    icon: 'fab fa-jira',
    component: SettingsJiraUsers,
  },
];

const activeTab = computed(() => {
  return tabs.find((tabItem) => tabItem.name === tab.value);
});
</script>
