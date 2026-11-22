import React, { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/http';
import { createLead, deleteLead, getLeadStats, updateLead } from '../api/leads';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LeadForm } from '../components/LeadForm';
import { LeadModal } from '../components/LeadModal';
import { LeadTable, SortableField } from '../components/LeadTable';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatsBar } from '../components/StatsBar';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { useToast } from '../hooks/useToast';
import { CreateLeadPayload, Lead, LeadStats } from '../types/lead';
import { FormErrors } from '../utils/validation';

export const LeadsPage: React.FC = () => {
  const toast = useToast();
  const { user, logout } = useAuth();

  // Search, Filter, Sort & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState<SortableField>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Statistics State
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Data fetching hook (with AbortController race-safety)
  const { leads, meta, isLoading, error, refetch } = useLeads({
    search,
    status,
    sortBy,
    order,
    page,
    limit,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});

  // Delete Confirmation State
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Dashboard Statistics
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await getLeadStats();
      setStats(data);
    } catch {
      // Non-blocking: stats failure shouldn't crash the table
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // Search change handler with page reset
  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  // Status filter change handler with page reset
  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  }, []);

  // Sorting handler
  const handleSort = (field: SortableField) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  // Page limit change handler
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setServerErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setServerErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setServerErrors({});
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (formData: CreateLeadPayload) => {
    setServerErrors({});
    try {
      if (editingLead) {
        // Update existing lead
        await updateLead(editingLead.id, formData);
        toast.success(`Updated lead: ${formData.name}`);
      } else {
        // Create new lead
        await createLead(formData);
        toast.success(`Created lead: ${formData.name}`);
      }

      handleCloseModal();
      void refetch();
      void fetchStats();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          const mappedErrors: FormErrors = {};
          err.details.forEach((detail) => {
            if (detail.field in formData || detail.field === 'email') {
              mappedErrors[detail.field as keyof FormErrors] = detail.message;
            }
          });
          setServerErrors(mappedErrors);
        }
        toast.error(err.message || 'Operation failed. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDeleteDialog = (lead: Lead) => {
    setDeletingLead(lead);
  };

  // Close Delete Confirmation Dialog
  const handleCloseDeleteDialog = () => {
    setDeletingLead(null);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingLead) return;

    setIsDeleting(true);
    try {
      await deleteLead(deletingLead.id);
      toast.success(`Deleted lead: ${deletingLead.name}`);
      handleCloseDeleteDialog();

      // If the last lead on a page > 1 was deleted, go back to previous page
      if (leads.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        void refetch();
      }
      void fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const isFiltered = Boolean(search || status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-none">
                  Lead Manager
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200/50">
                  CRM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Pipeline & Customer Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
              Total Leads:{' '}
              <strong className="text-slate-800 font-semibold">
                {stats?.total ?? meta.total}
              </strong>
            </span>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Leads
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Capture, qualify, and track prospective clients across your sales
              stages.
            </p>
          </div>
        </div>

        {/* Dashboard Statistics Bar */}
        <StatsBar
          stats={stats}
          selectedStatus={status}
          onSelectStatus={handleStatusChange}
          isLoading={isStatsLoading}
        />

        {/* Search & Filter Controls */}
        <SearchFilterBar
          initialSearch={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          onAddLead={handleOpenAddModal}
        />

        {/* Error Alert with Retry State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Unable to load leads
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="px-4 py-2 text-xs font-semibold text-rose-800 bg-white border border-rose-300 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-colors shadow-2xs self-end sm:self-auto"
            >
              Retry Request
            </button>
          </div>
        )}

        {/* Leads Table Component with Sorting and Pagination */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          isFiltered={isFiltered}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          page={page}
          limit={limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteDialog}
          onAddLead={handleOpenAddModal}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Add / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLead ? 'Edit Lead Details' : 'Add New Lead'}
      >
        <LeadForm
          initialLead={editingLead}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          serverErrors={serverErrors}
        />
      </LeadModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLead)}
        title="Delete Lead"
        message={`Delete "${deletingLead?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </div>
  );
};
