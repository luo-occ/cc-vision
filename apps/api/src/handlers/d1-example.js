// Example: Using Cloudflare D1 database in Workers
// This shows how to migrate from PostgreSQL to D1

export async function d1Handler(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Example: Query D1 database (env.DB comes from wrangler.toml)
    const accounts = await env.DB.prepare(`
      SELECT id, name, account_type, currency, is_default, is_active, created_at, updated_at 
      FROM accounts 
      WHERE is_active = 1
    `).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: accounts.results,
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
        error: 'Database error',
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

// Example: Creating tables in D1
export async function initializeD1Tables(env) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      quantity REAL NOT NULL,
      average_price REAL NOT NULL,
      asset_type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts (id)
    )`
  ];

  for (const sql of statements) {
    await env.DB.prepare(sql).run();
  }
}
