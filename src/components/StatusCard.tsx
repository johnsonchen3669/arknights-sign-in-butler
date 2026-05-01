import type { StatusViewModel } from '@/lib/types';
import { translate } from '@/lib/chrome-api';

interface StatusCardProps {
  status: StatusViewModel;
}

export function StatusCard({ status }: StatusCardProps) {
  const statusClassName =
    status.statusTone === 'success'
      ? 'bg-[#e7f5ef] text-success'
      : status.statusTone === 'warning'
        ? 'bg-[#fff1df] text-warning'
        : 'bg-panel text-slate-500';

  return (
    <section className="mb-3 rounded-[20px] border border-white/70 bg-white/88 p-3.5 shadow-card backdrop-blur-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Daily status</div>
          <div className="mt-1 text-base font-semibold text-ink">{status.statusText}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClassName}`}>{status.statusText}</span>
      </div>
      <div className="rounded-2xl bg-panel px-3 py-2.5 text-[13px]">
        <div className="mb-1 text-muted">{translate('lastCheckInLabel', 'Last Check-in:')}</div>
        <div className="font-semibold leading-5 text-slate-700">{status.lastCheckInText}</div>
      </div>
    </section>
  );
}