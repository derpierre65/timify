<template>
  <q-banner
    v-if="visible"
    :class="[textClass, backgroundColor, 'tw:min-h-[48px]']"
    rounded
  >
    <template #avatar>
      <div class="q-mt-auto">
        <slot name="icon">
          <q-circular-progress v-if="type === 'loading'" size="sm" indeterminate />
          <q-icon v-else-if="leftIcon" v-bind="leftIcon" />
        </slot>
      </div>
    </template>

    <div class="tw:flex tw:items-center tw:gap-2">
      <div class="tw:flex-auto" :class="contentClass">
        <slot />
      </div>

      <div v-if="dismissible">
        <slot name="dismissible">
          <q-btn
            icon="fas fa-times"
            :color="typeColors[type]"
            size="xs"
            round
            unelevated
            dense
            @click="visible = false"
          />
        </slot>
      </div>
    </div>
  </q-banner>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';

//#region Composable & Prepare
const props = withDefaults(defineProps<{

  /** Type of the alert */
  type: keyof typeof typeColors;
  contentClass?: string | object | string[] | object[];
  icon?: string;
  text?: boolean;
  dismissible?: boolean;
}>(), {
  contentClass: '',
  icon: '',
});

defineSlots<{
  default: [];
  dismissible: [];
  icon: [];
}>();

const attrs = useAttrs();
//#endregion

//#region Data
const typeColors = {
  info: 'blue',
  success: 'green',
  error: 'red',
  warning: 'orange',
  loading: 'blue',
};
const visible = ref(true);
//#endregion

//#region Computed
const textClass = computed(() => {
  if (!props.text && props.type !== 'loading') {
    return 'text-white';
  }
  if (props.type === 'info' || props.type === 'loading') {
    return 'text-blue';
  }
  if (props.type === 'success') {
    return 'text-green';
  }
  if (props.type === 'error') {
    return 'text-red';
  }
  if (props.type === 'warning') {
    return 'text-orange';
  }

  return '';
});
const leftIcon = computed(() => {
  const attributes = {
    class: [] as string[],
    name: props.icon,
    size: attrs.dense ? 'sm' : 'md',
  };

  if (!attributes.name) {
    if (props.type === 'info') {
      attributes.name = 'fas fa-circle-info';
    }
    else if (props.type === 'success') {
      attributes.name = 'fas fa-check';
    }
    else if (props.type === 'error') {
      attributes.name = 'fas fa-xmark';
    }
    else if (props.type === 'warning') {
      attributes.name = 'fas fa-triangle-exclamation';
    }

    attributes.class.push(textClass.value);
  }

  if (!attributes.name) {
    return null;
  }

  return attributes;
});
const backgroundColor = computed(() => {
  if (props.type === 'info' || props.type === 'loading') {
    return props.text || props.type === 'loading' ? 'tw:bg-blue-500/10!' : 'bg-blue text-white';
  }
  if (props.type === 'success') {
    return props.text ? 'tw:bg-green-500/10!' : 'bg-green text-white';
  }
  if (props.type === 'error') {
    return props.text ? 'tw:bg-red-500/10!' : 'bg-red text-white';
  }
  if (props.type === 'warning') {
    return props.text ? 'tw:bg-yellow-500/10!' : 'bg-orange text-white';
  }

  return '';
});
//#endregion

//#region Watch
//#endregion

//#region Lifecycle Events
//#endregion

//#region Methods
//#endregion

//#region Created
//#endregion
</script>
