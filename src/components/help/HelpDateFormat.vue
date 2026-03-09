<template>
  <q-table
    :columns="columns"
    :rows="rows"
    :rows-per-page-options="[0]"
    separator="horizontal"
    flat
    bordered
    dark
    hide-bottom
  >
    <template #body-cell-formats="props">
      <q-td :props="props">
        <ul>
          <li v-for="format in props.row.formats" :key="format.token">
            <strong>{{ format.token }}</strong>: {{ format.example }}
          </li>
        </ul>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
const columns = [
  {
    name: 'unit',
    label: 'Unit',
    field: 'unit',
    align: 'left' as const,
  },
  {
    name: 'formats',
    label: 'Formats available',
    field: 'formats',
    align: 'left' as const,
  },
];

const rows = [
  {
    unit: 'Year',
    formats: [
      {
        token: 'YY',
        example: '70 71 ... 29 30',
      },
      {
        token: 'YYYY',
        example: '1970 1971 ... 2029 2030',
      },
    ],
  },
  {
    unit: 'Month',
    formats: [
      {
        token: 'M',
        example: '1 2 ... 11 12',
      },
      {
        token: 'Mo',
        example: '1st 2nd ... 11th 12th',
      },
      {
        token: 'MM',
        example: '01 02 ... 11 12',
      },
      {
        token: 'MMM',
        example: 'Jan Feb ... Nov Dec',
      },
      {
        token: 'MMMM',
        example: 'January February ... November December',
      },
    ],
  },
  {
    unit: 'Quarter',
    formats: [
      {
        token: 'Q',
        example: 'Quarter number 1 2 3 4',
      },
      {
        token: 'Qo',
        example: 'Quarter number 1st 2nd 3rd 4th',
      },
    ],
  },
  {
    unit: 'Day of Month',
    formats: [
      {
        token: 'D',
        example: '1 2 ... 30 31',
      },
      {
        token: 'Do',
        example: '1st 2nd ... 30th 31st',
      },
      {
        token: 'DD',
        example: '01 02 ... 30 31',
      },
    ],
  },
  {
    unit: 'Day of Year',
    formats: [
      {
        token: 'DDD',
        example: '1 2 ... 364 365',
      },
      {
        token: 'DDDo',
        example: '1st 2nd ... 364th 365th',
      },
      {
        token: 'DDDD',
        example: '001 002 ... 364 365',
      },
    ],
  },
  {
    unit: 'Day of Week',
    formats: [
      {
        token: 'd',
        example: '0 1 ... 5 6',
      },
      {
        token: 'do',
        example: '0th 1st ... 5th 6th',
      },
      {
        token: 'dd',
        example: 'Su Mo ... Fr Sa',
      },
      {
        token: 'ddd',
        example: 'Sun Mon ... Fri Sat',
      },
      {
        token: 'dddd',
        example: 'Sunday Monday ... Friday Saturday',
      },
    ],
  },
  {
    unit: 'Day of Week (ISO)',
    formats: [
      {
        token: 'E',
        example: '1 2 ... 6 7',
      },
    ],
  },
  {
    unit: 'Week of Year',
    formats: [
      {
        token: 'w',
        example: '1 2 ... 52 53',
      },
      {
        token: 'wo',
        example: '1st 2nd ... 52nd 53rd',
      },
      {
        token: 'ww',
        example: '01 02 ... 52 53',
      },
    ],
  },
  {
    unit: 'Hour',
    formats: [
      {
        token: 'H',
        example: '0 1 ... 22 23',
      },
      {
        token: 'HH',
        example: '00 01 ... 22 23',
      },
      {
        token: 'h',
        example: '0 ... 11 12',
      },
      {
        token: 'hh',
        example: '01 02 ... 11 12',
      },
    ],
  },
  {
    unit: 'Minute',
    formats: [
      {
        token: 'm',
        example: '0 1 ... 58 59',
      },
      {
        token: 'mm',
        example: '00 01 ... 58 59',
      },
    ],
  },
  {
    unit: 'Second',
    formats: [
      {
        token: 's',
        example: '0 1 ... 58 59',
      },
      {
        token: 'ss',
        example: '00 01 ... 58 59',
      },
    ],
  },
  {
    unit: 'Fractional Second',
    formats: [
      {
        token: 'S',
        example: '0 1 ... 8 9',
      },
      {
        token: 'SS',
        example: '00 01 ... 98 99',
      },
      {
        token: 'SSS',
        example: '000 001 ... 998 999',
      },
    ],
  },
  {
    unit: 'Timezone offset',
    formats: [
      {
        token: 'Z',
        example: '-07:00 -06:00 ... +06:00 +07:00',
      },
      {
        token: 'ZZ',
        example: '-0700 -0600 ... +0600 +0700',
      },
    ],
  },
  {
    unit: 'AM/PM',
    formats: [
      {
        token: 'A',
        example: 'AM, PM',
      },
      {
        token: 'a',
        example: 'am, pm',
      },
      {
        token: 'aa',
        example: 'a.m, p.m',
      },
    ],
  },
  {
    unit: 'Unix Timestamp',
    formats: [
      {
        token: 'X',
        example: '1360013296',
      },
      {
        token: 'x (ms)',
        example: '1360013296123',
      },
    ],
  },
];
</script>
