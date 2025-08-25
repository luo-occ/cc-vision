// Account Router - Routes requests to appropriate handlers

import { createMethodNotAllowedResponse, createValidationErrorResponse } from '../utils/responseHelpers.js';
import { parsePathParts, parseAccountId } from '../utils/requestHelpers.js';

export class AccountRouter {
  constructor(accountHandlers) {
    this.handlers = accountHandlers;
  }

  async route(request) {
    const pathParts = parsePathParts(request.url);
    const method = request.method;

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Route based on path structure
    // pathParts: ['api', 'accounts', ...]

    // GET /api/accounts/default/current
    if (method === 'GET' && pathParts.length === 4 && 
        pathParts[2] === 'default' && pathParts[3] === 'current') {
      return this.handlers.getDefaultAccount(request);
    }

    // GET /api/accounts/active/list
    if (method === 'GET' && pathParts.length === 4 && 
        pathParts[2] === 'active' && pathParts[3] === 'list') {
      return this.handlers.getActiveAccounts(request);
    }

    // GET /api/accounts/tags
    if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'tags') {
      return this.handlers.getAllTags(request);
    }

    // GET /api/accounts/by-tags?tags=...
    if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'by-tags') {
      return this.handlers.getAccountsByTags(request);
    }

    // POST /api/accounts/{id}/default
    if (method === 'POST' && pathParts.length === 4 && pathParts[3] === 'default') {
      const accountId = parseAccountId(pathParts);
      if (!accountId) {
        return createValidationErrorResponse('Account ID is required');
      }
      return this.handlers.setDefaultAccount(request, accountId);
    }

    // Routes with account ID: /api/accounts/{id}
    const accountId = parseAccountId(pathParts);
    
    if (pathParts.length === 3) {
      // /api/accounts/{id} or /api/accounts
      if (!accountId) {
        // /api/accounts (no ID)
        switch (method) {
          case 'GET':
            return this.handlers.getAccounts(request);
          case 'POST':
            return this.handlers.createAccount(request);
          default:
            return createMethodNotAllowedResponse();
        }
      } else {
        // /api/accounts/{id}
        switch (method) {
          case 'GET':
            return this.handlers.getAccount(request, accountId);
          case 'PUT':
            return this.handlers.updateAccount(request, accountId);
          case 'DELETE':
            return this.handlers.deleteAccount(request, accountId);
          default:
            return createMethodNotAllowedResponse();
        }
      }
    }

    // If we reach here, the route is not recognized
    return createMethodNotAllowedResponse();
  }
}