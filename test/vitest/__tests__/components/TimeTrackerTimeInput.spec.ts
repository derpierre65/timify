import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeTrackerTimeInput from 'components/time-tracker/TimeTrackerTimeInput.vue';
import { date } from 'quasar';

installQuasarPlugin();

describe('TimeTrackerTimeInput', () => {
  async function expectInputs(values: Record<string, string>, referenceDate = 'Wed, 18 Jun 2025 12:00:00 GMT') {
    for (const key of Object.keys(values)) {
      const modelValue = new Date(referenceDate);
      const wrapper = mount(TimeTrackerTimeInput, {
        props: {
          modelValue,
        },
      });

      const inputField = wrapper.find('input');
      inputField.element.value = key;
      await inputField.trigger('change');
      expect(wrapper.vm.currentValue).eq(values[key], `input value: ${key} | expect: ${values[key]}`);
      expect(date.formatDate(modelValue, 'YYYY-MM-DD')).eq(
        date.formatDate(wrapper.vm.modelValue, 'YYYY-MM-DD'),
        `input value: ${key} | expect: ${values[key]}`,
      );
    }
  }

  it('should contains the current value', async() => {
    const date = new Date('Wed, 18 Jun 2025 12:00:00 GMT');
    const wrapper = mount(TimeTrackerTimeInput, {
      props: {
        modelValue: date,
      },
    });
    expect(wrapper.vm.currentValue).toBe('12:00');
  });

  it('should use 23:59 for 24 inputs', async() => {
    await expectInputs({
      '24:00': '23:59',
      '24:0': '23:59',
      '24:': '23:59',
      24: '23:59',
      2400: '23:59',
    });
  });


  it('should accept xx:yy inputs', async() => {
    await expectInputs({
      '01:01': '01:01',
      '11:30': '11:30',
      '12:00': '12:00',
      '16:00': '16:00',
      '23:59': '23:59',
    });
  });

  it('should accept x:yy inputs', async() => {
    await expectInputs({
      '1:01': '01:01',
      '1:1': '01:01',
      '1:10': '01:10',
      '9:40': '09:40',
    });
  });


  it('should accept only hours', async() => {
    await expectInputs({
      1: '01:00',
      10: '10:00',
      16: '16:00',
    });
  });

  it('should accept inputs without a colon', async() => {
    await expectInputs({
      1240: '12:40',
      940: '09:40',
      94: '09:04',
      235: '23:05',
    });
  });

  it('should accept inputs with a dot or comma separator and calculate the right minutes', async() => {
    await expectInputs({
      3.5: '03:30',
      '3,5': '03:30',
      '12,5': '12:30',
      12.05: '12:03',
      '12,05': '12:03',
      '12,95': '12:57',
    });
  });

  it('should add values to the current time', async() => {
    await expectInputs({
      '+5': '12:05',
      '+5h': '17:00',
      '+5h 10m': '17:10',
      '+5h10m': '17:10',
    });
  });

  it('should stay in the same day', async() => {
    await expectInputs({
      '-50h': '00:00',
      '-50000': '00:00',
      '-50000m': '00:00',
    });
  });

  it('should calculate the right date with + or -', async() => {
    await expectInputs({
      '10:00+3h': '13:00',
      '10:00+3h 30m': '13:30',
      '10+3h 30m': '13:30',
      '103+3h 30m': '13:33',
      '1030+3h 30m': '14:00',
      '9+3h 30m': '12:30',
    });
  });
});
