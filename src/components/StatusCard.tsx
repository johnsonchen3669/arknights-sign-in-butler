import type { StatusViewModel } from '@/lib/types';
import { translate } from '@/lib/chrome-api';

interface StatusCardProps {
  status: StatusViewModel;
}

export function StatusCard({ status }: StatusCardProps) {
  const statusClassName =
    status.statusTone === 'success'
      ? 'text-success'
      : status.statusTone === 'warning'
        ? 'text-warning'
        : 'text-slate-500';

  return (
    <section className="mb-3 rounded-lg bg-white p-3 shadow-card">
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="text-muted">{translate('lastCheckInLabel', 'Last Check-in:')}</span>
        <span className="font-semibold text-slate-700">{status.lastCheckInText}</span>
      </div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">{translate('statusLabel', 'Status:')}</span>
        <span className={`font-semibold ${statusClassName}`}>{status.statusText}</span>
      </div>
    </section>
  );
}