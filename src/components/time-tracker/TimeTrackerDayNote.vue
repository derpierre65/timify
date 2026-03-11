<template>
  <div
    class="tw:group/note tw:px-2 tw:py-1 tw:bg-amber-950/30 tw:border-b tw:border-neutral-600
    tw:text-sm tw:min-h-[46px] tw:flex tw:items-center tw:gap-1 cursor-pointer"
    @click="startEdit"
  >
    <q-icon
      name="fas fa-sticky-note"
      class="tw:text-amber-500 tw:shrink-0"
      size="xs"
    />

    <template v-if="editing">
      <q-input
        v-model="noteText"
        :label="$t('note.placeholder')"
        type="textarea"
        class="tw:flex-auto"
        autogrow
        autofocus
        dense
        dark
      />
      <div class="tw:flex tw:border tw:rounded tw:p-1 tw:bg-neutral-800 tw:border-neutral-600 tw:gap-1">
        <q-btn
          :disable="!noteText.trim()"
          class="tw:bg-green-900! tw:text-gray-400"
          icon="fas fa-check"
          size="sm"
          square
          dense
          @click.stop="save"
        >
          <q-tooltip>{{ $t('global.save') }}</q-tooltip>
        </q-btn>
        <q-btn
          class="tw:bg-neutral-700! tw:text-gray-400"
          icon="fas fa-times"
          size="sm"
          dense
          @click.stop="cancel"
        >
          <q-tooltip>{{ $t('global.cancel') }}</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template v-else-if="note">
      <span class="tw:whitespace-pre-wrap tw:flex-1">{{ note.text }}</span>
      <div class="tw:hidden tw:group-hover/note:flex tw:gap-1 tw:shrink-0">
        <q-icon
          name="fas fa-pen"
          class="cursor-pointer tw:text-orange-500"
          size="xs"
          @click="startEdit"
        />
        <q-icon
          name="fas fa-trash"
          class="cursor-pointer tw:text-red-500"
          size="xs"
          @click="emit('delete')"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type DayNote } from 'stores/dayNote';

const props = withDefaults(defineProps<{
  note?: DayNote | null;
}>(), {
  note: null,
});

const emit = defineEmits<{
  save: [text: string];
  cancel: [];
  delete: [];
}>();

const editing = ref(!props.note);
const noteText = ref(props.note?.text ?? '');

function startEdit() {
  if (props.note) {
    noteText.value = props.note.text;
    editing.value = true;
  }
}

function save() {
  const text = noteText.value.trim();
  if (!text) {
    return;
  }

  emit('save', text);
  editing.value = false;
}

function cancel() {
  editing.value = false;
  if (props.note) {
    noteText.value = props.note.text;
  }
  else {
    emit('cancel');
  }
}
</script>
