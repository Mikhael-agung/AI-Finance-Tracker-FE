import { useState, useCallback } from 'react';
import { api } from '@/lib/api/client';
import ENDPOINTS from '@/lib/api/endpoints';
import { Transaction, TransactionFilters } from '@/types/transaction.types';
import { PaginatedResponse } from '@/types/api.types';

export const useTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all transactions with filters
  const getTransactions = useCallback(async (filters?: TransactionFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedResponse<Transaction>>(
        ENDPOINTS.TRANSACTIONS.BASE,
        filters
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single transaction
  const getTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Transaction>(
        ENDPOINTS.TRANSACTIONS.BY_ID(id)
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create transaction
  const createTransaction = useCallback(async (data: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Transaction>(
        ENDPOINTS.TRANSACTIONS.BASE,
        data
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update transaction
  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<Transaction>(
        ENDPOINTS.TRANSACTIONS.BY_ID(id),
        data
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete<{ success: boolean }>(
        ENDPOINTS.TRANSACTIONS.BY_ID(id)
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk import
  const bulkImport = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ count: number }>(
        ENDPOINTS.TRANSACTIONS.BULK_IMPORT,
        formData
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import transactions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkImport,
  };
};

export default useTransactions;