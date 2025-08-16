import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './portfolio.db';

const migrateHoldingsTable = () => {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // Check if account_id column exists
    db.get("PRAGMA table_info(holdings)", (err, rows) => {
      if (err) {
        console.error('Error checking table structure:', err);
        return;
      }

      // Get all columns
      db.all("PRAGMA table_info(holdings)", (err, columns) => {
        if (err) {
          console.error('Error getting table columns:', err);
          return;
        }

        const hasAccountId = columns.some((col: any) => col.name === 'account_id');
        
        if (!hasAccountId) {
          console.log('Adding account_id column to holdings table...');
          
          // Add account_id column
          db.run("ALTER TABLE holdings ADD COLUMN account_id TEXT", (err) => {
            if (err) {
              console.error('Error adding account_id column:', err);
              return;
            }
            
            console.log('Successfully added account_id column');
            
            // Get the default account ID
            db.get("SELECT id FROM accounts WHERE is_default = 1", (err, row) => {
              if (err) {
                console.error('Error getting default account:', err);
                return;
              }
              
              if (row) {
                const defaultAccountId = row.id;
                console.log(`Setting account_id to default account: ${defaultAccountId}`);
                
                // Update all existing holdings to use the default account
                db.run("UPDATE holdings SET account_id = ?", [defaultAccountId], (err) => {
                  if (err) {
                    console.error('Error updating holdings with account_id:', err);
                    return;
                  }
                  
                  console.log('Successfully updated all holdings with default account_id');
                  
                  // Add foreign key constraint
                  db.run("CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id)", (err) => {
                    if (err) {
                      console.error('Error creating index:', err);
                    } else {
                      console.log('Successfully created index on account_id');
                    }
                    
                    db.close((err) => {
                      if (err) {
                        console.error('Error closing database:', err);
                      } else {
                        console.log('Migration completed successfully');
                      }
                    });
                  });
                });
              } else {
                console.error('No default account found');
                db.close();
              }
            });
          });
        } else {
          console.log('account_id column already exists');
          db.close();
        }
      });
    });
  });
};

if (require.main === module) {
  migrateHoldingsTable();
}

export { migrateHoldingsTable };