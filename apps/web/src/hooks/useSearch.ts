import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export function useSearch(query: string, type?: 'stock' | 'crypto') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => apiClient.searchAssets(query, type),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}