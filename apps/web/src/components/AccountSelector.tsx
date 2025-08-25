'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types/portfolio';
import { useActiveAccounts } from '@/hooks/useAccounts';

interface AccountSelectorProps {
  value?: string;
  onValueChange: (accountId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AccountSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select account", 
  disabled = false 
}: AccountSelectorProps) {
  const { data: accounts, isLoading } = useActiveAccounts();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading accounts..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex flex-col">
              <span className="font-medium">{account.name}</span>
              <span className="text-sm text-muted-foreground">
                {account.currency}
                {account.tags && account.tags.length > 0 && ` • ${account.tags.map(tag => tag.name).filter(Boolean).join(', ')}`}
                {account.isDefault && ' • Default'}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}