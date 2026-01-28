-- Add master_prompt column to app_settings table
-- This prompt sets the tone for all AI interactions and is cached on login

DO $$
BEGIN
    -- Check if master_prompt column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'app_settings' 
        AND column_name = 'master_prompt'
    ) THEN
        ALTER TABLE app_settings 
        ADD COLUMN master_prompt TEXT DEFAULT '';
        
        RAISE NOTICE 'Added master_prompt column to app_settings table';
    ELSE
        RAISE NOTICE 'master_prompt column already exists';
    END IF;
END $$;

-- Optional: Set a default master prompt (you can customize this)
-- UPDATE app_settings 
-- SET master_prompt = 'You are Parihaaram AI, a wise and compassionate Vedic astrology expert. Speak with warmth, clarity, and depth. Your goal is to provide meaningful insights that empower users.'
-- WHERE master_prompt IS NULL OR master_prompt = '';

COMMENT ON COLUMN app_settings.master_prompt IS 'Master prompt that sets the tone for all AI interactions. Cached on user login.';
