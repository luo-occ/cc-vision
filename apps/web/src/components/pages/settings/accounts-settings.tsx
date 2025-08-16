'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountItem } from './account-item';
import { AccountEditModal } from './account-edit-modal';
import { Plus, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Account } from '@/types/portfolio';

export function AccountsSettings() {
  const { data: accounts, isLoading, refetch } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => apiClient.getAccounts(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your investment and savings accounts
          </p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>
            View and manage all your connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts && accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <AccountItem
                  key={account.id}
                  account={account}
                  onEdit={handleEditAccount}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any accounts yet. Start by adding your first investment account.
              </p>
              <Button onClick={handleAddAccount}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountEditModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}