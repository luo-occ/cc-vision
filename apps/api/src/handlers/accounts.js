// Accounts handler for Cloudflare Workers (using D1 database)

import { D1Database } from '../cloudflare/models/d1Database.js';

export async function accountsHandler(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Initialize D1 database
    const database = new D1Database(env.DB);
    
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Handle default account endpoint
      if (path.endsWith('/default/current')) {
        const defaultAccount = await database.getDefaultAccount();
        
        if (!defaultAccount) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'No default account found' 
            }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            data: defaultAccount,
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      // Handle active accounts list endpoint
      if (path.endsWith('/active/list')) {
        const accounts = await database.getAccounts();
        
        return new Response(
          JSON.stringify({
            success: true,
            data: accounts,
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      // Get all accounts from D1
      const accounts = await database.getAccounts();
      
      return new Response(
        JSON.stringify({
          success: true,
          data: accounts,
          timestamp: new Date().toISOString(),
          source: 'Cloudflare D1'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    if (request.method === 'POST') {
      // Create new account
      const accountData = await request.json();
      
      // Validate required fields
      if (!accountData.name || !accountData.accountType) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: name, accountType' 
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      // Generate ID if not provided
      if (!accountData.id) {
        accountData.id = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Set defaults
      accountData.currency = accountData.currency || 'USD';
      accountData.isDefault = accountData.isDefault || false;
      accountData.isActive = accountData.isActive !== false; // Default to true
      
      const success = await database.createAccount(accountData);
      
      if (success) {
        const createdAccount = await database.getAccountById(accountData.id);
        return new Response(
          JSON.stringify({
            success: true,
            data: createdAccount,
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1'
          }),
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }
    
    // Handle POST and DELETE requests
    const url = new URL(request.url);
    const path = url.pathname;
    const pathParts = path.split('/');
    
    // Check if this is a "set default account" request: /api/accounts/{id}/default
    if (pathParts.length >= 4 && pathParts[3] === 'default') {
      const accountId = pathParts[2];
      
      try {
        await database.setDefaultAccount(accountId);
        
        return new Response(
          JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to set default account',
            message: error.message 
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle DELETE request for specific account: /api/accounts/{id}
    if (request.method === 'DELETE' && pathParts.length >= 3) {
      const accountId = pathParts[2];
      
      try {
        const success = await database.deleteAccount(accountId);
        
        if (!success) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Account not found' 
            }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: error.message 
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in accounts handler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}
