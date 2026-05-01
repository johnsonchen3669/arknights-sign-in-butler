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
  const readyMessage = translate('readyStatus', 'Ready');

  useEffect(() => {
    let isMounted = true;

    loadPopupState().then((loadedState) => {
      if (!isMounted) {
        return;
      }

      setState(loadedState);
      setStatus(buildStatusViewModel(loadedState));
    });

    return () => {
      isMounted = false;
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
    try {
      await savePopupState(state.checkTime, state.signInMode);
      setMessage(readyMessage);
      setMessageTone('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : translate('signInFailed', 'Failed, please try again'));
      setMessageTone('error');
    }
  };

  const handleManualSignIn = async () => {
    try {
      await triggerManualSignIn();
      setMessage(translate('startingSignIn', 'Starting sign-in...'));
      setMessageTone('success');
      window.setTimeout(() => window.close(), 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : translate('signInFailed', 'Failed, please try again'));
      setMessageTone('error');
    }
  };

  const messageClassName =
    messageTone === 'success'
      ? 'text-success'
      : messageTone === 'error'
        ? 'text-red-600'
        : 'text-slate-500';

  return (
    <div className="w-popup bg-panel px-3.75 py-3.75 text-[#333333]">
      <header className="mb-4 flex items-center border-b border-slate-200 pb-2.5">
        <img alt="Icon" className="mr-2.5 h-6 w-6" src="/icon.png" />
        <h1 className="m-0 text-base text-ink">{translate('headerTitle', 'Arknights Sign-in Butler')}</h1>
      </header>

      <StatusCard status={status} />

      <SettingsCard
        checkTime={state.checkTime}
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
        className="w-full rounded-md bg-[#6200ee] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3700b3]"
        type="button"
        onClick={handleManualSignIn}
      >
        {translate('manualBtnText', 'Manual Sign-in Now')}
      </button>

      <div className={`mt-2.5 text-center text-xs ${messageClassName}`}>{message}</div>

      <footer className="mt-3 border-t border-slate-200 pt-2.5 text-center text-[11px]">
        <a
          className="text-primary no-underline hover:underline"
          href="https://github.com/johnsonchen3669/arknights-sign-in-butler"
          rel="noreferrer"
          target="_blank"
        >
          {translate('githubLinkText', 'GitHub')}
        </a>
        <span className="text-slate-500"> {' '}· v1.1.0</span>
      </footer>
    </div>
  );
}