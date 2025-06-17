<template>
  <q-input
    :model-value="currentValue"
    type="text"
    @change="onUpdate"
  />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { date } from 'quasar';

const modelValue = defineModel<Date>({
  required: true,
});

const currentValue = computed(() => {
  return date.formatDate(modelValue.value, 'HH:mm');
});

function onUpdate(newValue: string) {
  const originalNewValue = newValue;
  let newTime = '';

  if (newValue.match(/^[0-9]+[,.][0-9]+$/g)) {
    console.log('found delmiter', newValue.replace(',', '.'));
    const splitted = newValue.replace(',', '.').split('.');
    if (splitted[1]) {
      let seconds = -1;
      if (splitted[1].length === 2) {
        seconds = parseInt(splitted[1]) / 100;
      }
      else if (splitted[1].length === 1) {
        seconds = parseInt(splitted[1]) / 10;
      }

      if (seconds >= 0) {
        newValue = splitted[0] + ('0' + Math.round(seconds * 60)).slice(-2);
      }
    }
  }
  // 17:9 => 179 => 17:09
  else if (newValue.match(/^([01]\d|2[0-3]):(\d?)$/g)) {
    newValue = newValue.replace(':', '');
  }

  // 17:9+5
  const splittedPlus = newValue.split(/[+-]/g);
  if (splittedPlus[1]) {
    if (splittedPlus[0]) {
      newValue = splittedPlus[0];
    }
    else {
      newValue = date.formatDate(modelValue.value, 'HHmm');
    }
  }

  console.log('looking for:', newValue, newValue.match(/[0-9]{4}/g));
  if (newValue.match(/^([01]\d|2[0-3]):?([0-5]\d?)$/g)) {
    console.log('first match');
    newTime = newValue.substring(0, 2) + ':' + newValue.substring(2).replace(':', '');
  }
  else if (newValue === '2400' || newValue === '24:00') {
    console.log('second match');
    newTime = '23:59';
  }
  else if (newValue.match(/^[0-9]+$/g) && parseInt(newValue) >= 0 && parseInt(newValue) <= 24) {
    console.log('third match');
    if (newValue === '24') {
      newTime = '23:59';
    }
    else {
      newTime = ('0' + newValue).slice(-2) + ':00';
    }
  }
  else if (newValue.length === 3 && !isNaN(parseInt(newValue.substring(2)))) {
    console.log('fourth match');
    const minutes = parseInt(newValue.substring(2));
    let finalMinutes = '';
    if (minutes >= 0 && minutes <= 5) {
      finalMinutes = minutes + '0';
    }
    else {
      finalMinutes = '0' + minutes;
    }

    newTime = newValue.substring(0, 2) + ':' + finalMinutes;
  }

  console.log('result', newTime);

  if (!newTime) {
    return;
  }

  const newDate = new Date(modelValue.value);
  newDate.setHours(parseInt(newTime.substring(0, 2)));
  newDate.setMinutes(parseInt(newTime.substring(3, 5)));

  if (splittedPlus[1]) {
    const multiplier = originalNewValue.includes('+') ? 1 : -1;
    const matches = splittedPlus[1].matchAll(/^((?<hours>\d+)h)?[,\s]*((?<minutes>\d+)m?)?|\d+$/g);
    const potentialNewDate = new Date(newDate);

    for (const match of matches) {
      const hours = (match.groups?.hours ? parseInt(match.groups.hours) : 0) * multiplier;
      const minutes = (match.groups?.minutes ? parseInt(match.groups.minutes) : 0) * multiplier;
      if (hours !== 0) {
        potentialNewDate.setHours(potentialNewDate.getHours() + hours);
      }
      if (minutes !== 0) {
        potentialNewDate.setMinutes(potentialNewDate.getMinutes() + minutes);
      }
    }

    if (newDate.getDate() !== potentialNewDate.getDate()) {
      const isGreater = potentialNewDate.getTime() > newDate.getTime();
      potentialNewDate.setTime(newDate.getTime());
      if (isGreater) {
        potentialNewDate.setHours(23);
        potentialNewDate.setMinutes(59);
        potentialNewDate.setSeconds(59);
      }
      else {
        potentialNewDate.setHours(0);
        potentialNewDate.setMinutes(0);
        potentialNewDate.setSeconds(0);
      }
    }

    newDate.setTime(potentialNewDate.getTime());
  }

  modelValue.value = newDate;
}

watchEffect(() => {
  console.log('test:', date.formatDate(modelValue.value, 'DD.MM.YYYY HH:mm'));
});

</script>
