import React from 'react';
import { SOURCE_LABELS } from '../constants/leads';
import { Lead } from '../types/lead';
import { StatusBadge } from './StatusBadge';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  isFiltered: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAddLead: () => void;
  onResetFilters: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  isFiltered,
  onEdit,
  onDelete,
  onAddLead,
  onResetFilters,
}) => {
  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1 max-w-sm">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-28 hidden md:block" />
              <div className="h-4 bg-slate-100 rounded w-24 hidden lg:block" />
              <div className="h-6 bg-slate-200 rounded-full w-20" />
              <div className="h-8 bg-slate-100 rounded-lg w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        {isFiltered ? (
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No matching leads found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              No leads match your current search and filter criteria. Try
              adjusting or resetting them.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No leads yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Add your first lead to start tracking potential clients, deals,
              and follow-ups.
            </p>
            <button
              type="button"
              onClick={onAddLead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Your First Lead</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pl-6 pr-3">
                Lead
              </th>
              <th scope="col" className="py-3.5 px-3">
                Contact
              </th>
              <th scope="col" className="py-3.5 px-3">
                Company
              </th>
              <th scope="col" className="py-3.5 px-3">
                Source
              </th>
              <th scope="col" className="py-3.5 px-3">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {leads.map((lead) => {
              const initials = lead.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name & Initials */}
                  <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 leading-5">
                          {lead.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Added{' '}
                          {new Date(lead.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-800 hover:text-brand-600 font-medium transition-colors"
                      >
                        {lead.email}
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-4 px-3 whitespace-nowrap font-medium text-slate-800">
                    {lead.company}
                  </td>

                  {/* Source */}
                  <td className="py-4 px-3 whitespace-nowrap text-slate-600 text-xs">
                    <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 font-medium">
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                        title="Edit Lead"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(lead)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                        title="Delete Lead"
                        aria-label={`Delete ${lead.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-slate-900 text-base">
                  {lead.name}
                </h4>
                <p className="text-xs font-medium text-slate-500">
                  {lead.company}
                </p>
              </div>
              <StatusBadge status={lead.status} size="sm" />
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Email:</span>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-brand-600 truncate"
                >
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Phone:</span>
                <a href={`tel:${lead.phone}`} className="text-slate-700">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Source:</span>
                <span>{SOURCE_LABELS[lead.source] || lead.source}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onEdit(lead)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(lead)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
