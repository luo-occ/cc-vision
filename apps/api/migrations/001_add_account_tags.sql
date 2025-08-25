-- Migration to add account tags support and remove account types
-- This migration will be run manually on the production database

-- Step 1: Create account_tags table
CREATE TABLE IF NOT EXISTS account_tags (
    account_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, tag_name),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_account_tags_account_id ON account_tags(account_id);
CREATE INDEX IF NOT EXISTS idx_account_tags_tag_name ON account_tags(tag_name);

-- Step 3: Migrate existing account types as tags
-- First, let's see what account types exist
-- SELECT DISTINCT account_type FROM accounts;

-- Insert tags for existing accounts based on their account types
INSERT INTO account_tags (account_id, tag_name)
SELECT id, LOWER(account_type) 
FROM accounts 
WHERE account_type IS NOT NULL 
AND account_type != '';

-- For accounts with no account_type, add a default tag
INSERT INTO account_tags (account_id, tag_name)
SELECT id, 'general'
FROM accounts 
WHERE account_type IS NULL OR account_type = '';

-- Step 4: We'll keep the account_type column for now during transition
-- but we'll stop using it in the application logic

-- Step 5: Create a view to easily get accounts with their tags
CREATE OR REPLACE VIEW accounts_with_tags AS
SELECT 
    a.*,
    COALESCE(
        json_agg(
            json_build_object(
                'tag_name', at.tag_name,
                'created_at', at.created_at
            )
        ) FILTER (WHERE at.tag_name IS NOT NULL),
        '[]'
    ) as tags
FROM accounts a
LEFT JOIN account_tags at ON a.id = at.account_id
GROUP BY a.id;

-- Step 6: Create function to get accounts by tags
CREATE OR REPLACE FUNCTION get_accounts_by_tags(tag_names TEXT[])
RETURNS TABLE (
    id TEXT,
    name TEXT,
    account_type TEXT,
    group_name TEXT,
    currency TEXT,
    is_default BOOLEAN,
    is_active BOOLEAN,
    platform_id TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tags JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT awt.*
    FROM accounts_with_tags awt
    WHERE awt.id IN (
        SELECT DISTINCT at.account_id
        FROM account_tags at
        WHERE at.tag_name = ANY(tag_names)
    )
    ORDER BY awt.is_default DESC, awt.name ASC;
END;
$$ LANGUAGE plpgsql;