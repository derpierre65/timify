import { Dialog, Notify, QDialogOptions, QNotifyCreateOptions } from 'quasar';
import i18next from 'i18next';

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

function confirmAction(titleOrMessage: string | QDialogOptions, message?: string) {
  return new Promise((resolve) => {
    const defaultOpts: QDialogOptions = {
      title: (message && typeof titleOrMessage === 'string' ? titleOrMessage : undefined) || '',
      message: message || (typeof titleOrMessage === 'string' ? titleOrMessage : undefined) || '',
      color: 'negative',
      ok: {
        color: 'primary',
        label: i18next.t('global.confirm'),
        dense: true,
        noCaps: true,
      },
      cancel: {
        color: 'primary',
        label: i18next.t('global.cancel'),
        dense: true,
        outline: true,
        noCaps: true,
      },
      noBackdropDismiss: true,
      html: true,
    };

    // TODO improve merge (Object.assign)
    Dialog.create(typeof titleOrMessage === 'object' ? Object.assign(defaultOpts, titleOrMessage) : defaultOpts)
      .onOk((data) => resolve(data || true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false));
  });
}

export {
  confirmAction,
  showErrorMessage,
  showSuccessMessage,
};
