'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { Account, NewAccount } from '@/types/portfolio';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['SECURITIES', 'CRYPTO', 'RETIREMENT', 'SAVINGS', 'CHECKING']),
  currency: z.string().min(1, 'Currency is required'),
  group: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  platformId: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account ? {
      name: account.name,
      accountType: account.accountType,
      currency: account.currency,
      group: account.group || '',
      isDefault: account.isDefault,
      isActive: account.isActive,
      platformId: account.platformId || '',
    } : {
      name: '',
      accountType: 'SECURITIES',
      currency: 'USD',
      group: '',
      isDefault: false,
      isActive: true,
      platformId: '',
    },
  });

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const watchedValues = watch();

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          updates: data,
        });
      } else {
        await createAccount.mutateAsync(data as NewAccount);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Personal Brokerage"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              value={watchedValues.accountType}
              onValueChange={(value: 'SECURITIES' | 'CRYPTO' | 'RETIREMENT' | 'SAVINGS' | 'CHECKING') => setValue('accountType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SECURITIES">Securities</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="RETIREMENT">Retirement</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CHECKING">Checking</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-500">{errors.accountType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={watchedValues.currency}
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-500">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Group (Optional)</Label>
            <Input
              id="group"
              {...register('group')}
              placeholder="e.g., Investment Accounts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platformId">Platform ID (Optional)</Label>
            <Input
              id="platformId"
              {...register('platformId')}
              placeholder="e.g., broker-platform-id"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={watchedValues.isDefault}
              onCheckedChange={(checked) => setValue('isDefault', checked)}
            />
            <Label htmlFor="isDefault">Default Account</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watchedValues.isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        <div className="flex justify-between pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
  );
}