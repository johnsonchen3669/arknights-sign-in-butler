import { translate } from '@/lib/chrome-api';
import type { SignInMode } from '@/lib/types';

interface SettingsCardProps {
  checkTime: string;
  signInMode: SignInMode;
  onCheckTimeChange: (value: string) => void;
  onSignInModeChange: (value: SignInMode) => void;
  onSave: () => void;
}

const modes: Array<{ value: SignInMode; label: string }> = [
  { value: 'endfield', label: 'gameModeEndfield' },
  { value: 'arknights', label: 'gameModeArknights' },
  { value: 'both', label: 'gameModeBoth' }
];

export function SettingsCard({
  checkTime,
  signInMode,
  onCheckTimeChange,
  onSignInModeChange,
  onSave
}: SettingsCardProps) {
  return (
    <section className="mb-3 rounded-lg bg-white p-3 shadow-card">
      <div className="mb-2.5 block text-[13px]">
        <span className="text-muted">{translate('gameSelectionLabel', 'Sign-in Mode:')}</span>
        <div className="mt-2 grid gap-1.5">
          {modes.map((mode) => (
            <label key={mode.value} className="flex items-center gap-2 text-[13px] text-slate-700">
              <input
                checked={signInMode === mode.value}
                name="signInMode"
                type="radio"
                value={mode.value}
                onChange={() => onSignInModeChange(mode.value)}
              />
              <span>{translate(mode.label as never, mode.value)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">{translate('autoSignInTimeLabel', 'Auto Sign-in Time:')}</span>
        <input
          className="rounded border border-slate-300 px-2 py-1 text-[13px]"
          id="checkTime"
          type="time"
          value={checkTime}
          onChange={(event) => onCheckTimeChange(event.currentTarget.value)}
        />
      </div>

      <button
        className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
        type="button"
        onClick={onSave}
      >
        {translate('saveSettingsBtnText', 'Save Settings')}
      </button>
    </section>
  );
}