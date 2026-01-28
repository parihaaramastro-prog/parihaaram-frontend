-- Check and fix chat_messages content column type
-- This ensures the content column can store unlimited text

-- First, let's check the current column type
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name = 'content';

-- If the column is VARCHAR with a limit, alter it to TEXT
-- This command is safe to run even if it's already TEXT
ALTER TABLE chat_messages 
ALTER COLUMN content TYPE TEXT;

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name = 'content';

-- Also check chat_logs table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'chat_logs'
    ) THEN
        ALTER TABLE chat_logs 
        ALTER COLUMN ai_response TYPE TEXT;
        
        ALTER TABLE chat_logs 
        ALTER COLUMN user_message TYPE TEXT;
        
        RAISE NOTICE 'Updated chat_logs columns to TEXT';
    END IF;
END $$;
