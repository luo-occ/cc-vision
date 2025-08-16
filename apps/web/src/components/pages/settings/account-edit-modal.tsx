'use client';

import { AccountForm } from '@/components/AccountForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Account } from '@/types/portfolio';

interface AccountEditModalProps {
  account?: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AccountEditModal({ account, isOpen, onClose }: AccountEditModalProps) {
  const handleSuccess = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
          <DialogDescription>
            {account 
              ? 'Update your account information and settings.'
              : 'Add a new investment or savings account to track.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <AccountForm 
          account={account || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}