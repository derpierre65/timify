<template>
  <router-view />
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue';
import { useInterval, useQuasar } from 'quasar';
import { currentDateInjectionKey } from 'src/lib/keys';

useQuasar().dark.set(true);

const currentDate = ref(new Date());

provide(currentDateInjectionKey, currentDate);

useInterval().registerInterval(() => {
  currentDate.value = new Date();
}, 997);
</script>
