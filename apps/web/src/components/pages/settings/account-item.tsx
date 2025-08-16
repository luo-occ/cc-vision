'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Account } from '@/types/portfolio';
import { useDeleteAccount } from '@/hooks/useAccounts';

interface AccountItemProps {
  account: Account;
  onEdit: (account: Account) => void;
}

export function AccountItem({ account, onEdit }: AccountItemProps) {
  const deleteAccount = useDeleteAccount();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
      try {
        await deleteAccount.mutateAsync(account.id);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'SECURITIES': return 'Securities';
      case 'CRYPTO': return 'Crypto';
      case 'RETIREMENT': return 'Retirement';
      case 'SAVINGS': return 'Savings';
      case 'CHECKING': return 'Checking';
      default: return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'SECURITIES': return 'bg-blue-100 text-blue-800';
      case 'CRYPTO': return 'bg-purple-100 text-purple-800';
      case 'RETIREMENT': return 'bg-green-100 text-green-800';
      case 'SAVINGS': return 'bg-yellow-100 text-yellow-800';
      case 'CHECKING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold">{account.name}</h3>
              {account.isDefault && (
                <Badge variant="secondary">Default</Badge>
              )}
              {!account.isActive && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              <Badge className={getAccountTypeColor(account.accountType)}>
                {getAccountTypeLabel(account.accountType)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Currency: {account.currency}</span>
              {account.group && (
                <span>Group: {account.group}</span>
              )}
              <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(account)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                  disabled={deleteAccount.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}