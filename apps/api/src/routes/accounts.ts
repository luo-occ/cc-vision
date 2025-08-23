import { Router } from 'express';
import { Account, NewAccount, AccountUpdate, ApiResponse } from '../types/shared';
import AccountService from '../services/accountService';

const router = Router();

export default function createAccountRoutes(accountService: AccountService) {
  // Get all accounts
  router.get('/', async (req, res) => {
    try {
      const isActive = req.query.active === 'true' ? true : 
                      req.query.active === 'false' ? false : undefined;
      
      const accounts = await accountService.getAccounts(isActive);
      const response: ApiResponse<Account[]> = {
        success: true,
        data: accounts
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting accounts:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve accounts'
      };
      res.status(500).json(response);
    }
  });

  // Get account by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const account = await accountService.getAccount(id);
      
      if (!account) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Account not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Account> = {
        success: true,
        data: account
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve account'
      };
      res.status(500).json(response);
    }
  });

  // Create new account
  router.post('/', async (req, res) => {
    try {
      const accountData: NewAccount = req.body;
      
      // Validate required fields
      if (!accountData.name || accountData.name.trim() === '') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Account name is required'
        };
        return res.status(400).json(response);
      }

      if (!accountData.currency || accountData.currency.trim() === '') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Currency is required'
        };
        return res.status(400).json(response);
      }

      const account = await accountService.createAccount(accountData);
      
      const response: ApiResponse<Account> = {
        success: true,
        data: account
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account'
      };
      res.status(500).json(response);
    }
  });

  // Update account
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates: AccountUpdate = req.body;

      if (!updates.name || updates.name.trim() === '') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Account name is required'
        };
        return res.status(400).json(response);
      }

      const account = await accountService.updateAccount(id, updates);
      
      if (!account) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Account not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Account> = {
        success: true,
        data: account
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account'
      };
      res.status(500).json(response);
    }
  });

  // Delete account
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await accountService.deleteAccount(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Account not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete account'
      };
      res.status(500).json(response);
    }
  });

  // Get default account
  router.get('/default/current', async (req, res) => {
    try {
      const account = await accountService.getDefaultAccount();
      
      if (!account) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No default account found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Account> = {
        success: true,
        data: account
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting default account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve default account'
      };
      res.status(500).json(response);
    }
  });

  // Set default account
  router.post('/:id/default', async (req, res) => {
    try {
      const { id } = req.params;
      await accountService.setDefaultAccount(id);
      
      const response: ApiResponse<null> = {
        success: true
      };
      res.json(response);
    } catch (error) {
      console.error('Error setting default account:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to set default account'
      };
      res.status(500).json(response);
    }
  });

  // Get active accounts
  router.get('/active/list', async (req, res) => {
    try {
      const accounts = await accountService.getActiveAccounts();
      const response: ApiResponse<Account[]> = {
        success: true,
        data: accounts
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting active accounts:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve active accounts'
      };
      res.status(500).json(response);
    }
  });

  return router;
}