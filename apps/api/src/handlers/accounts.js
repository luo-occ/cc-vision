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
