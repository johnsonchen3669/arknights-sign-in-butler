import { useEffect, useState } from 'react';

import {
  buildStatusViewModel,
  DEFAULT_CHECK_TIME,
  DEFAULT_SIGN_IN_MODE,
  loadPopupState,
  savePopupState,
  translate,
  triggerManualSignIn
} from '@/lib/chrome-api';
import type { PopupState, SignInMode, StatusViewModel } from '@/lib/types';
import { InfoPanel } from '@/components/InfoPanel';
import { SettingsCard } from '@/components/SettingsCard';
import { StatusCard } from '@/components/StatusCard';

const INITIAL_STATE: PopupState = {
  checkTime: DEFAULT_CHECK_TIME,
  signInMode: DEFAULT_SIGN_IN_MODE,
  lastCheckInDateByGame: {}
};

export function PopupApp() {
  const [state, setState] = useState<PopupState>(INITIAL_STATE);
  const [status, setStatus] = useState<StatusViewModel>(() => buildStatusViewModel(INITIAL_STATE));
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'neutral'>('neutral');
  const [isSaving, setIsSaving] = useState(false);
  const [isManualSignInPending, setIsManualSignInPending] = useState(false);
  const localizedTitle = translate('headerTitle', 'Arknights Sign-in Butler');
  const readyMessage = translate('readyStatus', 'Ready');
  const manualButtonLabel = translate('manualBtnText', 'Manual Sign-in Now');

  const refreshState = async () => {
    const loadedState = await loadPopupState();
    setState(loadedState);
    setStatus(buildStatusViewModel(loadedState));
    return loadedState;
  };

  useEffect(() => {
    void refreshState();
  }, []);

  useEffect(() => {
    document.title = localizedTitle;
  }, [localizedTitle]);

  useEffect(() => {
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== 'local') {
        return;
      }

      if (!changes.checkTime && !changes.signInMode && !changes.lastCheckInDateByGame) {
        return;
      }

      void refreshState();
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    if (messageTone !== 'success' || message !== readyMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage('');
      setMessageTone('neutral');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [message, messageTone, readyMessage]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePopupState(state.checkTime, state.signInMode);
      await refreshState();
      setMessage(readyMessage);
      setMessageTone('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : translate('signInFailed', 'Failed, please try again'));
      setMessageTone('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSignIn = async () => {
    setIsManualSignInPending(true);
    try {
      await triggerManualSignIn();
      setMessage(translate('startingSignIn', 'Starting sign-in...'));
      setMessageTone('success');
      window.setTimeout(() => window.close(), 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : translate('signInFailed', 'Failed, please try again'));
      setMessageTone('error');
      setIsManualSignInPending(false);
    }
  };

  const messageClassName =
    messageTone === 'success'
      ? 'text-success'
      : messageTone === 'error'
        ? 'text-red-600'
        : 'text-slate-500';

  return (
    <div className="w-popup px-3.75 py-3.75 text-[#333333]">
      <header className="mb-4 rounded-3xl border border-white/75 bg-white/72 px-3.5 py-3 shadow-card backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#c95d3f_0%,#8f341f_100%)] shadow-[0_10px_22px_rgba(143,52,31,0.22)]">
            <img alt="Icon" className="h-6 w-6" src="/icon.png" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">SKPORT Butler</div>
            <h1 className="m-0 text-base font-semibold text-ink">{localizedTitle}</h1>
          </div>
        </div>
      </header>

      <StatusCard status={status} />

      <SettingsCard
        checkTime={state.checkTime}
        disabled={isSaving || isManualSignInPending}
        isSaving={isSaving}
        signInMode={state.signInMode}
        onCheckTimeChange={(value) => setState((current) => ({ ...current, checkTime: value }))}
        onSave={handleSave}
        onSignInModeChange={(value: SignInMode) => {
          setState((current) => {
            const nextState = { ...current, signInMode: value };
            setStatus(buildStatusViewModel(nextState));
            return nextState;
          });
        }}
      />

      <InfoPanel />

      <button
        className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-secondary px-3 py-3 text-sm font-semibold text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSaving || isManualSignInPending}
        type="button"
        onClick={handleManualSignIn}
      >
        {isManualSignInPending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        ) : null}
        {manualButtonLabel}
      </button>

      <div className={`mt-2.5 min-h-4 text-center text-xs ${messageClassName}`}>{message}</div>

      <footer className="mt-3 border-t border-[#d7ccc5] pt-2.5 text-center text-[11px] text-muted">
        <a
          className="text-primary no-underline hover:underline"
          href="https://github.com/johnsonchen3669/arknights-sign-in-butler"
          rel="noreferrer"
          target="_blank"
        >
          {translate('githubLinkText', 'GitHub')}
        </a>
        <span> {' '}· v1.1.0</span>
      </footer>
    </div>
  );
}