-- Migration to add account tags support for D1 (Cloudflare Workers)
-- This will be applied automatically when the worker initializes

-- Step 1: Create account_tags table
CREATE TABLE IF NOT EXISTS account_tags (
    account_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, tag_name)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_tags_account_id ON account_tags(account_id);
CREATE INDEX IF NOT EXISTS idx_account_tags_tag_name ON account_tags(tag_name);

-- Step 3: Migrate existing account types as tags
-- This will be done in the initialization code