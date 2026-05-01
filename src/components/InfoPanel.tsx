import { translate } from '@/lib/chrome-api';

export function InfoPanel() {
  return (
    <section className="mb-3 rounded-lg bg-info-bg px-3 py-2.5 text-[11px] leading-5 text-info-ink">
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