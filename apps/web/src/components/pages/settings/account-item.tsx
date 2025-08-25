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

  const getTagColor = (tag: string) => {
    // Generate consistent colors for different tags
    const tagColors: Record<string, string> = {
      'retirement': 'bg-green-100 text-green-800',
      'savings': 'bg-yellow-100 text-yellow-800',
      'checking': 'bg-gray-100 text-gray-800',
      'crypto': 'bg-purple-100 text-purple-800',
      'investment': 'bg-blue-100 text-blue-800',
      '401k': 'bg-green-100 text-green-800',
      'roth': 'bg-emerald-100 text-emerald-800',
      'taxable': 'bg-orange-100 text-orange-800',
      'emergency': 'bg-red-100 text-red-800',
    };
    return tagColors[tag.toLowerCase()] || 'bg-slate-100 text-slate-800';
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
            </div>
            
            {/* Display tags */}
            {account.tags && account.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {account.tags.map((tag, index) => (
                  tag.name && (
                    <Badge key={index} className={getTagColor(tag.name)} variant="outline">
                      {tag.name}
                    </Badge>
                  )
                ))}
              </div>
            )}
            
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
                {!account.isDefault && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive"
                    disabled={deleteAccount.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}