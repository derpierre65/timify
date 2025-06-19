import { Notify, QNotifyCreateOptions } from 'quasar';

function showNotificationMessage(text: string, options: QNotifyCreateOptions = {}) {
  options.timeout ??= 3_000;

  Notify.create({
    message: text,
    position: 'top',
    ...options,
  });
}

function showErrorMessage(text: string, options: QNotifyCreateOptions = {}) {
  options.type ??= 'negative';

  return showNotificationMessage(text, options);
}

function showSuccessMessage(text: string, options: QNotifyCreateOptions = {}) {
  options.type ??= 'positive';

  return showNotificationMessage(text, options);
}

export {
  showErrorMessage,
  showSuccessMessage,
};
