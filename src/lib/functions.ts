import { showErrorMessage } from 'src/lib/ui';
import i18next from 'i18next';

function catchError(error: unknown) {
  console.error(error);

  showErrorMessage(i18next.t('error.unknown'));

  return null;
}

export {
  catchError,
};
