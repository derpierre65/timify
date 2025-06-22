<template>
  <div class="flex tw:gap-4">
    <div class="flex column tw:w-24">
      <slot name="start">
        <span class="tw:text-xs">{{ $t('table.start') }}</span>
        <span>{{ date.formatDate(start, 'HH:mm') }}</span>
      </slot>
    </div>
    <div class="flex column tw:w-24">
      <slot v-if="end" name="end">
        <span class="tw:text-xs">{{ $t('table.end') }}</span>
        <span v-if="end" class="tw:flex-auto flex column justify-center">{{ date.formatDate(end, 'HH:mm') }}</span>
      </slot>
      <template v-else>
        <span class="tw:text-xs">{{ $t('table.end') }}</span>
        <i class="fas fa-ellipsis-h tw:flex-auto flex column justify-center">
          <q-tooltip>{{ $t('table.end_pending') }}</q-tooltip>
        </i>
      </template>
    </div>
    <div class="flex column tw:w-20">
      <span class="tw:text-xs">{{ $t('table.total') }}</span>
      <span class="tw:flex-auto flex column justify-center">{{ totalTime.hours }}h {{ totalTime.minutes }}m</span>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import { computed, inject, Ref } from 'vue';
import { parseSeconds } from 'src/lib/date';
import { currentDateInjectionKey } from 'src/lib/keys';

const props = defineProps<{
  start: Date;
  end: Date | null;
}>();

defineSlots<{
  start: () => void;
  end: () => void;
}>();

const currentDate = inject<Ref<Date>>(currentDateInjectionKey)!;

const totalTime = computed(() => {
  return parseSeconds(((props.end || currentDate.value).getTime() - props.start.getTime()) / 1_000);
});
</script>
