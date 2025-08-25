// Accounts handler for Cloudflare Workers (using D1 database)
// Refactored to use service layer and clean architecture

import { D1Database } from '../cloudflare/models/d1Database.js';
import { AccountService } from '../services/accountService.js';
import { AccountHandlers } from './accountHandlers.js';
import { AccountRouter } from './accountRouter.js';

export async function accountsHandler(request, env) {
  try {
    // Initialize dependencies
    const database = new D1Database(env.DB);
    const accountService = new AccountService(database);
    const accountHandlers = new AccountHandlers(accountService);
    const accountRouter = new AccountRouter(accountHandlers);

    // Route the request
    return await accountRouter.route(request);
  } catch (error) {
    console.error('Error in accounts handler:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}