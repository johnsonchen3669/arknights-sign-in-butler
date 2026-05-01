import { translate } from '@/lib/chrome-api';
import type { SignInMode } from '@/lib/types';

interface SettingsCardProps {
  checkTime: string;
  signInMode: SignInMode;
  disabled?: boolean;
  isSaving?: boolean;
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
  disabled = false,
  isSaving = false,
  onCheckTimeChange,
  onSignInModeChange,
  onSave
}: SettingsCardProps) {
  return (
    <section className="mb-3 rounded-[20px] border border-white/70 bg-white/88 p-3.5 shadow-card backdrop-blur-sm">
      <div className="mb-3 block text-[13px]">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-muted">{translate('gameSelectionLabel', 'Sign-in Mode:')}</span>
          <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            SKPORT
          </span>
        </div>
        <div className="grid gap-2">
          {modes.map((mode) => (
            <label
              key={mode.value}
              className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-[13px] transition ${
                signInMode === mode.value
                  ? 'border-primary bg-[color:var(--color-ring)] text-ink shadow-sm'
                  : 'border-[#e8ddd6] bg-[#fffdfb] text-slate-700 hover:border-[#d4b3a7]'
              } ${disabled ? 'pointer-events-none opacity-70' : ''}`}
            >
              <input
                checked={signInMode === mode.value}
                className="h-4 w-4 accent-[var(--color-primary)]"
                disabled={disabled}
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

      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="font-medium text-muted">{translate('autoSignInTimeLabel', 'Auto Sign-in Time:')}</span>
        <input
          className="min-w-[124px] rounded-xl border border-[#d8ccc4] bg-[#fffaf6] px-2.5 py-1.5 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-3 focus:ring-[color:var(--color-ring)]"
          disabled={disabled}
          id="checkTime"
          type="time"
          value={checkTime}
          onChange={(event) => onCheckTimeChange(event.currentTarget.value)}
        />
      </div>

      <button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        disabled={disabled}
        type="button"
        onClick={onSave}
      >
        {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : null}
        {translate('saveSettingsBtnText', 'Save Settings')}
      </button>
    </section>
  );
}