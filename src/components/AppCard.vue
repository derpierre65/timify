<template>
  <q-card class="no-shadow tw:bg-neutral-800!">
    <template v-if="title || $slots.title || $slots.buttons">
      <q-card-section class="tw:flex q-py-sm">
        <div class="tw:text-lg tw:min-h-[36px] content-center">
          <slot name="title">
            {{ title }}
          </slot>
        </div>
        <q-space />
        <div class="q-gutter-x-xs tw:shrink-0">
          <slot name="buttons" />
        </div>
      </q-card-section>
      <q-separator />
    </template>

    <q-card-section :class="sectionClass">
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  sectionClass?: string;
}>(), {
  title: '',
  sectionClass: '',
});
</script>
