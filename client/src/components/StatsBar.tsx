import React from 'react';
import { STATUS_LABELS } from '../constants/leads';
import { LeadStats } from '../types/lead';

interface StatsBarProps {
  stats: LeadStats | null;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  isLoading?: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
  isLoading = false,
}) => {
  const cards: Array<{
    key: string;
    label: string;
    count: number;
    colorClasses: {
      border: string;
      activeRing: string;
      bg: string;
      badgeBg: string;
      badgeText: string;
      badgeDot: string;
    };
  }> = [
    {
      key: '',
      label: 'Total Leads',
      count: stats?.total ?? 0,
      colorClasses: {
        border: 'hover:border-slate-300',
        activeRing: 'ring-2 ring-slate-900 border-slate-900',
        bg: 'bg-white',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-800',
        badgeDot: 'bg-slate-500',
      },
    },
    {
      key: 'NEW',
      label: STATUS_LABELS.NEW,
      count: stats?.byStatus?.NEW ?? 0,
      colorClasses: {
        border: 'hover:border-blue-300',
        activeRing: 'ring-2 ring-blue-500 border-blue-500',
        bg: 'bg-white',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        badgeDot: 'bg-blue-500',
      },
    },
    {
      key: 'CONTACTED',
      label: STATUS_LABELS.CONTACTED,
      count: stats?.byStatus?.CONTACTED ?? 0,
      colorClasses: {
        border: 'hover:border-amber-300',
        activeRing: 'ring-2 ring-amber-500 border-amber-500',
        bg: 'bg-white',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        badgeDot: 'bg-amber-500',
      },
    },
    {
      key: 'QUALIFIED',
      label: STATUS_LABELS.QUALIFIED,
      count: stats?.byStatus?.QUALIFIED ?? 0,
      colorClasses: {
        border: 'hover:border-emerald-300',
        activeRing: 'ring-2 ring-emerald-500 border-emerald-500',
        bg: 'bg-white',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeDot: 'bg-emerald-500',
      },
    },
    {
      key: 'LOST',
      label: STATUS_LABELS.LOST,
      count: stats?.byStatus?.LOST ?? 0,
      colorClasses: {
        border: 'hover:border-rose-300',
        activeRing: 'ring-2 ring-rose-500 border-rose-500',
        bg: 'bg-white',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-700',
        badgeDot: 'bg-rose-500',
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const isSelected = selectedStatus === card.key;

        return (
          <button
            key={card.key || 'all'}
            type="button"
            onClick={() => onSelectStatus(card.key)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              card.colorClasses.bg
            } ${
              isSelected
                ? card.colorClasses.activeRing + ' shadow-sm'
                : 'border-slate-200/80 ' +
                  card.colorClasses.border +
                  ' shadow-xs'
            } focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${card.colorClasses.badgeDot}`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              {isLoading && !stats ? (
                <div className="h-7 w-12 bg-slate-200 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.count}
                </span>
              )}
              {isSelected && (
                <span className="text-[10px] font-semibold uppercase text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                  Active Filter
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
