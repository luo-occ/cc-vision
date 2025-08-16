import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account, NewAccount, AccountUpdate } from '@/types/portfolio';
import { apiClient } from '@/lib/api';

// Query keys
export const ACCOUNT_KEYS = {
  all: ['accounts'] as const,
  lists: () => [...ACCOUNT_KEYS.all, 'list'] as const,
  list: (isActive?: boolean) => [...ACCOUNT_KEYS.lists(), { isActive }] as const,
  details: () => [...ACCOUNT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ACCOUNT_KEYS.details(), id] as const,
  active: () => [...ACCOUNT_KEYS.all, 'active'] as const,
  default: () => [...ACCOUNT_KEYS.all, 'default'] as const,
};

// Hooks
export function useAccounts(isActive?: boolean) {
  return useQuery<Account[], Error>({
    queryKey: ACCOUNT_KEYS.list(isActive),
    queryFn: () => apiClient.getAccounts(isActive),
  });
}

export function useAccount(id: string) {
  return useQuery<Account, Error>({
    queryKey: ACCOUNT_KEYS.detail(id),
    queryFn: () => apiClient.getAccount(id),
    enabled: !!id,
  });
}

export function useActiveAccounts() {
  return useQuery<Account[], Error>({
    queryKey: ACCOUNT_KEYS.active(),
    queryFn: () => apiClient.getActiveAccounts(),
  });
}

export function useDefaultAccount() {
  return useQuery<Account, Error>({
    queryKey: ACCOUNT_KEYS.default(),
    queryFn: () => apiClient.getDefaultAccount(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, NewAccount>({
    mutationFn: (account: NewAccount) => apiClient.createAccount(account),
    onSuccess: () => {
      // Invalidate all account queries
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, { id: string; updates: AccountUpdate }>({
    mutationFn: ({ id, updates }) => apiClient.updateAccount(id, updates),
    onSuccess: (data) => {
      // Invalidate all account queries
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.detail(data.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => apiClient.deleteAccount(id),
    onSuccess: () => {
      // Invalidate all account queries
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
    },
  });
}

export function useSetDefaultAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => apiClient.setDefaultAccount(id),
    onSuccess: () => {
      // Invalidate all account queries
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
    },
  });
}