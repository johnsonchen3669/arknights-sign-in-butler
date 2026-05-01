import { translate } from '@/lib/chrome-api';

export function InfoPanel() {
  return (
    <section className="mb-3 rounded-[20px] border border-white/70 bg-info-bg/88 px-3.5 py-3 text-[11px] leading-5 text-info-ink shadow-card backdrop-blur-sm">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-info-ink/80">Background</div>
      <p className="mb-2">{translate('backgroundInfoText', 'Background execution info')}</p>
      <p className="mb-2">
        {translate(
          'backgroundPermissionText',
          'Remember to enable browser background apps for auto-launch to work.'
        )}
      </p>
      <p>{translate('backgroundSettingsPath', 'Chrome: Settings > System > Continue running background apps')}</p>
    </section>
  );
}