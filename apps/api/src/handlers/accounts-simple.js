// Simplified accounts handler for debugging

import { D1Database } from '../cloudflare/models/d1Database.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function accountsHandler(request, env) {
  try {
    const database = new D1Database(env.DB);
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = request.method;

    console.log('Request:', method, url.pathname, pathParts);

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Handle PUT /api/accounts/{id} - Update account
    if (method === 'PUT' && pathParts.length === 3) {
      const accountId = pathParts[2];
      console.log('PUT account:', accountId);
      
      try {
        const accountData = await request.json();
        console.log('Account data:', accountData);
        
        // Validate required fields
        if (!accountData.name) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Missing required field: name' 
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
        
        // Update the account
        const success = await database.updateAccount(accountId, accountData);
        
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
        
        // Handle tags if provided
        if (accountData.tags !== undefined) {
          if (Array.isArray(accountData.tags)) {
            await database.setAccountTags(accountId, accountData.tags);
          }
        }
        
        // Get the updated account
        const updatedAccount = await database.getAccountById(accountId);
        
        return new Response(
          JSON.stringify({
            success: true,
            data: updatedAccount,
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
        console.error('PUT account error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to update account',
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

    // Handle GET requests (existing functionality)
    if (method === 'GET') {
      if (pathParts.length === 2) {
        // GET /api/accounts
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
    }

    // Method not allowed
    console.log('Method not allowed:', method, pathParts);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        method: method,
        path: url.pathname
      }),
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
        success: false,
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