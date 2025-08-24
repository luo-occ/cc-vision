// Tests for AccountItem component - Default Account Protection
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountItem } from '../components/pages/settings/account-item';
import { useDeleteAccount } from '../hooks/useAccounts';

// Mock the useDeleteAccount hook
vi.mock('../hooks/useAccounts', () => ({
  useDeleteAccount: vi.fn()
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Edit: vi.fn(() => 'EditIcon'),
  MoreVertical: vi.fn(() => 'MoreVerticalIcon'),
  Trash2: vi.fn(() => 'Trash2Icon')
}));

// Mock UI components
vi.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  )
}));

vi.mock('../components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  )
}));

vi.mock('../components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={className} data-variant={variant} {...props}>{children}</span>
  )
}));

vi.mock('../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuItem: ({ children, onClick, className, disabled, ...props }: any) => (
    <div onClick={onClick} className={className} disabled={disabled} {...props}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild, ...props }: any) => (
    <div {...props}>{children}</div>
  )
}));

describe('AccountItem - Default Account Protection', () => {
  const mockOnEdit = vi.fn();
  const mockDeleteAccount = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup useDeleteAccount mock
    (useDeleteAccount as any).mockReturnValue({
      mutateAsync: mockDeleteAccount,
      isPending: false
    });
  });

  const mockDefaultAccount = {
    id: 'default-account-id',
    name: 'Default Account',
    accountType: 'SECURITIES',
    currency: 'USD',
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockNonDefaultAccount = {
    id: 'regular-account-id',
    name: 'Regular Account',
    accountType: 'SECURITIES',
    currency: 'USD',
    isDefault: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  describe('Delete button visibility', () => {
    it('should NOT show delete option for default account', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      // Check that delete button is not in the document
      const deleteButton = screen.queryByRole('button', { name: /delete account/i });
      expect(deleteButton).not.toBeInTheDocument();
      
      // Check that Trash2 icon is not in the document
      const trashIcon = screen.queryByText('Trash2Icon');
      expect(trashIcon).not.toBeInTheDocument();
    });

    it('should show delete option for non-default account', () => {
      render(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      // Check that delete button is in the document
      const deleteButton = screen.getByText('Delete Account');
      expect(deleteButton).toBeInTheDocument();
      
      // Check that Trash2 icon is in the document
      const trashIcon = screen.getByText('Trash2Icon');
      expect(trashIcon).toBeInTheDocument();
    });

    it('should show edit option for both default and non-default accounts', () => {
      const { rerender } = render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      // Check edit option for default account
      const editButton1 = screen.getByText('Edit Account');
      expect(editButton1).toBeInTheDocument();
      
      // Rerender with non-default account
      rerender(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      // Check edit option for non-default account
      const editButton2 = screen.getByText('Edit Account');
      expect(editButton2).toBeInTheDocument();
    });
  });

  describe('Default account badge', () => {
    it('should show "Default" badge for default account', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      const defaultBadge = screen.getByText('Default');
      expect(defaultBadge).toBeInTheDocument();
      expect(defaultBadge).toHaveAttribute('data-variant', 'secondary');
    });

    it('should NOT show "Default" badge for non-default account', () => {
      render(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      const defaultBadge = screen.queryByText('Default');
      expect(defaultBadge).not.toBeInTheDocument();
    });
  });

  describe('Delete functionality', () => {
    it('should call delete mutation when delete is clicked for non-default account', async () => {
      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      const deleteButton = screen.getByText('Delete Account');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Regular Account"?');
        expect(mockDeleteAccount).toHaveBeenCalledWith('regular-account-id');
      });
      
      confirmSpy.mockRestore();
    });

    it('should NOT call delete mutation when confirm is cancelled', async () => {
      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      const deleteButton = screen.getByText('Delete Account');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Regular Account"?');
        expect(mockDeleteAccount).not.toHaveBeenCalled();
      });
      
      confirmSpy.mockRestore();
    });

    it('should show loading state when delete is pending', () => {
      (useDeleteAccount as any).mockReturnValue({
        mutateAsync: mockDeleteAccount,
        isPending: true
      });
      
      render(<AccountItem account={mockNonDefaultAccount} onEdit={mockOnEdit} />);
      
      const deleteButton = screen.getByText('Deleting...');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Edit functionality', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockDefaultAccount);
    });

    it('should call onEdit when edit menu item is clicked', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      const editMenuItem = screen.getByText('Edit Account');
      fireEvent.click(editMenuItem);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockDefaultAccount);
    });
  });

  describe('Account type badge', () => {
    it('should show correct account type and color', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      const typeBadge = screen.getByText('Securities');
      expect(typeBadge).toBeInTheDocument();
      expect(typeBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should show crypto type with correct color', () => {
      const cryptoAccount = { ...mockNonDefaultAccount, accountType: 'CRYPTO' };
      
      render(<AccountItem account={cryptoAccount} onEdit={mockOnEdit} />);
      
      const typeBadge = screen.getByText('Crypto');
      expect(typeBadge).toBeInTheDocument();
      expect(typeBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });

  describe('Inactive account badge', () => {
    it('should show inactive badge for inactive accounts', () => {
      const inactiveAccount = { ...mockNonDefaultAccount, isActive: false };
      
      render(<AccountItem account={inactiveAccount} onEdit={mockOnEdit} />);
      
      const inactiveBadge = screen.getByText('Inactive');
      expect(inactiveBadge).toBeInTheDocument();
      expect(inactiveBadge).toHaveAttribute('data-variant', 'destructive');
    });

    it('should NOT show inactive badge for active accounts', () => {
      render(<AccountItem account={mockDefaultAccount} onEdit={mockOnEdit} />);
      
      const inactiveBadge = screen.queryByText('Inactive');
      expect(inactiveBadge).not.toBeInTheDocument();
    });
  });

  describe('Account information display', () => {
    it('should display account details correctly', () => {
      const accountWithGroup = {
        ...mockDefaultAccount,
        group: 'Investment',
        createdAt: '2024-01-01T00:00:00Z'
      };
      
      render(<AccountItem account={accountWithGroup} onEdit={mockOnEdit} />);
      
      expect(screen.getByText('Default Account')).toBeInTheDocument();
      expect(screen.getByText('Currency: USD')).toBeInTheDocument();
      expect(screen.getByText('Group: Investment')).toBeInTheDocument();
      expect(screen.getByText('Created: 1/1/2024')).toBeInTheDocument();
    });
  });
});