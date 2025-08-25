// Account route handlers - Clean separation of HTTP concerns

import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundResponse 
} from '../utils/responseHelpers.js';
import { 
  parseJsonBody, 
  validateAccountData, 
  parseQueryParams 
} from '../utils/requestHelpers.js';

export class AccountHandlers {
  constructor(accountService) {
    this.accountService = accountService;
  }

  // GET /api/accounts
  async getAccounts(request) {
    try {
      const accounts = await this.accountService.getAccounts();
      return createSuccessResponse(accounts);
    } catch (error) {
      return createErrorResponse(error);
    }
  }

  // GET /api/accounts/{id}
  async getAccount(request, accountId) {
    try {
      const account = await this.accountService.getAccountById(accountId);
      return createSuccessResponse(account);
    } catch (error) {
      if (error.message === 'Account not found') {
        return createNotFoundResponse(error.message);
      }
      return createErrorResponse(error);
    }
  }

  // POST /api/accounts
  async createAccount(request) {
    try {
      const accountData = await parseJsonBody(request);
      
      // Validate input
      const validationErrors = validateAccountData(accountData);
      if (validationErrors.length > 0) {
        return createValidationErrorResponse(validationErrors.join(', '));
      }

      const account = await this.accountService.createAccount(accountData);
      return createSuccessResponse(account, 201);
    } catch (error) {
      if (error.message.includes('validation') || error.message.includes('required')) {
        return createValidationErrorResponse(error.message);
      }
      return createErrorResponse(error);
    }
  }

  // PUT /api/accounts/{id}
  async updateAccount(request, accountId) {
    try {
      const accountData = await parseJsonBody(request);
      
      // Validate input
      const validationErrors = validateAccountData(accountData);
      if (validationErrors.length > 0) {
        return createValidationErrorResponse(validationErrors.join(', '));
      }

      const account = await this.accountService.updateAccount(accountId, accountData);
      return createSuccessResponse(account);
    } catch (error) {
      if (error.message === 'Account not found') {
        return createNotFoundResponse(error.message);
      }
      if (error.message.includes('validation') || error.message.includes('required')) {
        return createValidationErrorResponse(error.message);
      }
      return createErrorResponse(error);
    }
  }

  // DELETE /api/accounts/{id}
  async deleteAccount(request, accountId) {
    try {
      await this.accountService.deleteAccount(accountId);
      return createSuccessResponse();
    } catch (error) {
      if (error.message === 'Account not found') {
        return createNotFoundResponse(error.message);
      }
      return createErrorResponse(error);
    }
  }

  // GET /api/accounts/default/current
  async getDefaultAccount(request) {
    try {
      const account = await this.accountService.getDefaultAccount();
      return createSuccessResponse(account);
    } catch (error) {
      if (error.message === 'No default account found') {
        return createNotFoundResponse(error.message);
      }
      return createErrorResponse(error);
    }
  }

  // POST /api/accounts/{id}/default
  async setDefaultAccount(request, accountId) {
    try {
      await this.accountService.setDefaultAccount(accountId);
      return createSuccessResponse();
    } catch (error) {
      return createErrorResponse(error);
    }
  }

  // GET /api/accounts/active/list
  async getActiveAccounts(request) {
    try {
      // This is just an alias for getAccounts for backward compatibility
      const accounts = await this.accountService.getAccounts();
      return createSuccessResponse(accounts);
    } catch (error) {
      return createErrorResponse(error);
    }
  }

  // GET /api/accounts/tags
  async getAllTags(request) {
    try {
      const tags = await this.accountService.getAllTags();
      return createSuccessResponse(tags);
    } catch (error) {
      return createErrorResponse(error);
    }
  }

  // GET /api/accounts/by-tags?tags=tag1,tag2
  async getAccountsByTags(request) {
    try {
      const params = parseQueryParams(request.url);
      const tagsParam = params.tags;
      
      if (!tagsParam) {
        return createValidationErrorResponse('Tags parameter is required');
      }
      
      const tagNames = tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagNames.length === 0) {
        return createValidationErrorResponse('At least one tag must be provided');
      }

      const accounts = await this.accountService.getAccountsByTags(tagNames);
      return createSuccessResponse(accounts);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
}