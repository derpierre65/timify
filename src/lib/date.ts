import { useSettingsStore } from 'stores/settings';
import { date } from 'quasar';

function getWeekStartEnd(reference: Date) {
  const settings = useSettingsStore();

  // Get current day of week (0-6, 0 = Sunday)
  const currentDayOfWeek = reference.getDay();

  // Calculate offset based on firstWeekDay (1 = Monday, 7 = Sunday)
  // Convert settings.firstWeekDay to 0-6 format first
  const firstDayOffset = settings.firstWeekDay === 7 ? 0 : settings.firstWeekDay;

  // Calculate the difference to the start of the week
  const diff = currentDayOfWeek - firstDayOffset;
  const adjustedDiff = diff < 0 ? diff + 7 : diff;

  // Create start date (Monday or Sunday depending on settings)
  const weekStart = date.startOfDate(new Date(reference), 'day');
  weekStart.setDate(reference.getDate() - adjustedDiff);

  // Create end date (Sunday or Saturday depending on settings)
  const weekEnd = date.endOfDate(weekStart, 'day');
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    start: weekStart,
    end: weekEnd,
  };
}

function getDaysBetween(start: Date, end: Date) {
  const days: Array<{
    date: Date;
    formattedDate: string;
    dayOfWeek: number;
  }> = [];

  // Clone the start date to avoid modifying the original
  const currentDate = new Date(start);
  currentDate.setHours(0, 0, 0, 0);

  const settingsStore = useSettingsStore();

  while (currentDate <= end) {
    days.push({
      date: new Date(currentDate),
      formattedDate: date.formatDate(currentDate, settingsStore.dateFormat),
      dayOfWeek: currentDate.getDay(),
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function parseSeconds(seconds: number) {
  seconds = Math.abs(Math.round(seconds));

  const hours = Math.floor(seconds / 3_600);
  seconds -= hours * 3_600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return {
    hours: ('0' + hours).slice(-2),
    minutes: ('0' + minutes).slice(-2),
    seconds: ('0' + seconds).slice(-2),
  };
}

function formatHourAndMinutes(seconds: number) {
  const parsed = parseSeconds(seconds);
  const format = `${parsed.hours}h ${parsed.minutes}m`;

  if (seconds < 0) {
    return `-${format}`;
  }

  return format;
}

export {
  getWeekStartEnd,
  getDaysBetween,
  formatHourAndMinutes,
  parseSeconds,
};
