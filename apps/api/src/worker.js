// Cloudflare Workers entry point for Portfolio API

// Import API handlers (Cloudflare Workers format)
import { healthHandler } from './handlers/health.js';
import { accountsHandler } from './handlers/accounts.js';
import { portfolioHandler } from './handlers/portfolio.js';
import { D1Database } from './cloudflare/models/d1Database.js';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to create responses with CORS
function createResponse(data, status = 200, headers = {}) {
  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...headers,
      },
    }
  );
}

// Handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      // Initialize database on first request (if needed)
      if (env.DB) {
        const database = new D1Database(env.DB);
        // Initialize tables and ensure default account exists
        ctx.waitUntil(Promise.resolve().then(async () => {
          try {
            await database.initializeTables();
            await database.ensureDefaultAccount();
          } catch (error) {
            console.error('Database initialization error:', error);
          }
        }));
      }
      // Route API endpoints
      if (path === '/api/health' || path === '/health') {
        return await healthHandler(request, env);
      }
      
      if (path === '/api/accounts' || path === '/accounts') {
        return await accountsHandler(request, env);
      }
      
      if (path.startsWith('/api/portfolio') || path.startsWith('/portfolio')) {
        console.log('Routing to portfolio handler for path:', path);
        return await portfolioHandler(request, env);
      }

      // Default route - API info
      if (path === '/' || path === '/api') {
        return createResponse({
          name: 'Portfolio API',
          version: '1.0.0',
          environment: 'Cloudflare Workers',
          endpoints: {
            health: '/api/health',
            accounts: '/api/accounts',
            portfolio: '/api/portfolio'
          },
          timestamp: new Date().toISOString()
        });
      }

      // 404 for unknown routes
      return createResponse(
        { error: 'Not Found', path },
        404
      );

    } catch (error) {
      console.error('Worker error:', error);
      return createResponse(
        { 
          error: 'Internal Server Error', 
          message: error.message,
          timestamp: new Date().toISOString()
        },
        500
      );
    }
  },
};
