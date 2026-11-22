import React from 'react';
import { STATUS_LABELS, STATUS_STYLES } from '../constants/leads';
import { LeadStatus } from '../types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.NEW;
  const label = STATUS_LABELS[status] || status;

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      <span>{label}</span>
    </span>
  );
};
