import { useCallback, useEffect, useRef, useState } from 'react';
import { getLeads } from '../api/leads';
import { Lead, ListLeadsParams, PaginationMeta } from '../types/lead';

export interface UseLeadsOptions {
  search?: string;
  status?: string;
  sortBy?: 'name' | 'createdAt' | 'status' | 'company';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLeads = useCallback(async () => {
    // Abort previous request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params: ListLeadsParams = {
        search: options.search,
        status: options.status as ListLeadsParams['status'],
        sortBy: options.sortBy,
        order: options.order,
        page: options.page,
        limit: options.limit,
      };

      const res = await getLeads(params, controller.signal);
      setLeads(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(message);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [
    options.search,
    options.status,
    options.sortBy,
    options.order,
    options.page,
    options.limit,
  ]);

  useEffect(() => {
    void fetchLeads();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLeads]);

  return {
    leads,
    meta,
    isLoading,
    error,
    refetch: fetchLeads,
  };
}
