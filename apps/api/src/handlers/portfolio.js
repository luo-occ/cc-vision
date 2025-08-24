// Portfolio handler for Cloudflare Workers (using D1 database and KV cache)

import { D1Database } from '../cloudflare/models/d1Database.js';
import { CloudflareEnhancedPriceService } from '../cloudflare/services/cloudflareEnhancedPriceService.js';

export async function portfolioHandler(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Initialize services
    const database = new D1Database(env.DB);
    const priceService = new CloudflareEnhancedPriceService(env.PORTFOLIO_KV, env);
    
    if (request.method === 'GET') {
      // Get portfolio data
      const url = new URL(request.url);
      const accountId = url.searchParams.get('accountId');
      
      let holdings;
      if (accountId) {
        holdings = await database.getHoldingsByAccountId(accountId);
      } else {
        holdings = await database.getAllHoldings();
      }
      
      if (holdings.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              totalValue: 0,
              totalCost: 0,
              totalGainLoss: 0,
              totalGainLossPercent: 0,
              holdings: [],
              lastUpdated: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
            source: 'Cloudflare D1 + KV'
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
      
      // Get current prices for all holdings
      const symbols = holdings.map(h => h.symbol);
      const currentPrices = await priceService.getCurrentPrices(symbols);
      
      // Calculate portfolio with current prices
      let totalValue = 0;
      let totalCost = 0;
      
      const enrichedHoldings = holdings.map(holding => {
        const currentPrice = currentPrices[holding.symbol.toUpperCase()];
        const price = currentPrice ? currentPrice.price : holding.averagePrice;
        const marketValue = holding.quantity * price;
        const cost = holding.quantity * holding.averagePrice;
        const gainLoss = marketValue - cost;
        const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;
        
        totalValue += marketValue;
        totalCost += cost;
        
        return {
          id: holding.id,
          accountId: holding.accountId,
          symbol: holding.symbol,
          name: currentPrice?.name || holding.symbol,
          quantity: holding.quantity,
          costBasis: holding.averagePrice,
          currentPrice: price,
          currentValue: parseFloat(marketValue.toFixed(2)),
          gainLoss: parseFloat(gainLoss.toFixed(2)),
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
          type: holding.assetType?.toLowerCase() || 'stock'
        };
      });
      
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
      
      const portfolio = {
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalGainLoss: parseFloat(totalGainLoss.toFixed(2)),
        totalGainLossPercent: parseFloat(totalGainLossPercent.toFixed(2)),
        holdings: enrichedHoldings,
        lastUpdated: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify({
          success: true,
          data: portfolio,
          timestamp: new Date().toISOString(),
          source: 'Cloudflare D1 + KV'
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
      console.log('POST request received for path:', request.url);
      // Add new holding
      const holdingData = await request.json();
      
      // Validate required fields
      if (!holdingData.accountId || !holdingData.symbol || !holdingData.quantity || !holdingData.averagePrice) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: accountId, symbol, quantity, averagePrice' 
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
      if (!holdingData.id) {
        holdingData.id = `holding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Set defaults
      holdingData.assetType = holdingData.assetType || 'STOCK';
      
      const success = await database.createHolding(holdingData);
      
      if (success) {
        return new Response(
          JSON.stringify({
            success: true,
            data: holdingData,
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
          JSON.stringify({ error: 'Failed to create holding' }),
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

    if (request.method === 'DELETE') {
      // Delete holding
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      
      // Extract holding ID from path like /api/portfolio/holdings/holding-12345
      const holdingIdIndex = pathParts.indexOf('holdings') + 1;
      if (holdingIdIndex < pathParts.length) {
        const holdingId = pathParts[holdingIdIndex];
        
        const success = await database.deleteHolding(holdingId);
        
        if (success) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Holding deleted successfully',
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
        } else {
          return new Response(
            JSON.stringify({ 
              error: 'Holding not found or could not be deleted' 
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
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid holding ID format' }),
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
    console.error('Error in portfolio handler:', error);
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
