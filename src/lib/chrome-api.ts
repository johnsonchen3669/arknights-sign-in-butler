import type { GameId, PopupState, SignInMode, StatusViewModel } from '@/lib/types';

export const DEFAULT_CHECK_TIME = '00:30';
export const DEFAULT_SIGN_IN_MODE: SignInMode = 'endfield';

type MessageKey =
  | 'headerTitle'
  | 'lastCheckInLabel'
  | 'statusLabel'
  | 'manualBtnText'
  | 'noRecord'
  | 'idleStatus'
  | 'readyStatus'
  | 'startingSignIn'
  | 'signInFailed'
  | 'alreadySignedIn'
  | 'notSignedInYet'
  | 'autoSignInTimeLabel'
  | 'saveSettingsBtnText'
  | 'backgroundInfoText'
  | 'backgroundPermissionText'
  | 'backgroundSettingsPath'
  | 'githubLinkText'
  | 'gameSelectionLabel'
  | 'gameModeEndfield'
  | 'gameModeArknights'
  | 'gameModeBoth'
  | 'gameNameEndfield'
  | 'gameNameArknights';

export function translate(key: MessageKey, fallback: string): string {
  if (typeof chrome === 'undefined' || !chrome.i18n?.getMessage) {
    return fallback;
  }

  return chrome.i18n.getMessage(key) || fallback;
}

export function getSelectedGameIds(signInMode: SignInMode): GameId[] {
  if (signInMode === 'both') {
    return ['endfield', 'arknights'];
  }

  return [signInMode];
}

export function loadPopupState(): Promise<PopupState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['checkTime', 'signInMode', 'lastCheckInDateByGame'], (result) => {
      resolve({
        checkTime: result.checkTime || DEFAULT_CHECK_TIME,
        signInMode: (result.signInMode || DEFAULT_SIGN_IN_MODE) as SignInMode,
        lastCheckInDateByGame: result.lastCheckInDateByGame || {}
      });
    });
  });
}

export function savePopupState(checkTime: string, signInMode: SignInMode): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ checkTime, signInMode }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      chrome.runtime.sendMessage({ action: 'updateSchedule', time: checkTime }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      });
    });
  });
}

export function triggerManualSignIn(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'manualSignIn' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (response?.status === 'started') {
        resolve();
        return;
      }

      reject(new Error('Manual sign-in did not start.'));
    });
  });
}

export function buildStatusViewModel(state: PopupState): StatusViewModel {
  const today = new Date().toDateString();
  const gameIds = getSelectedGameIds(state.signInMode);
  const gameDateLabels = gameIds.map((gameId) => {
    const gameName = translate(
      gameId === 'arknights' ? 'gameNameArknights' : 'gameNameEndfield',
      gameId
    );
    const dateText = state.lastCheckInDateByGame[gameId] || translate('noRecord', 'No Record');
    return `${gameName}: ${dateText}`;
  });

  if (gameDateLabels.length === 0) {
    return {
      lastCheckInText: translate('noRecord', 'No Record'),
      statusText: translate('readyStatus', 'Ready'),
      statusTone: 'neutral'
    };
  }

  const signedTodayForAllGames = gameIds.every(
    (gameId) => state.lastCheckInDateByGame[gameId] === today
  );

  return {
    lastCheckInText: gameDateLabels.join(' | '),
    statusText: signedTodayForAllGames
      ? translate('alreadySignedIn', 'Already signed in today')
      : translate('notSignedInYet', 'Not signed in today'),
    statusTone: signedTodayForAllGames ? 'success' : 'warning'
  };
}