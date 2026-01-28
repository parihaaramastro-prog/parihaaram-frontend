# Master Prompt Implementation - Complete Guide

## Overview
This implementation adds a **Master Prompt** feature that sets the tone for all AI interactions. The master prompt is:
- Fetched and cached when a user logs in
- Prepended to all system prompts sent to the AI
- Managed through the Admin Dashboard
- Stored in the database for persistence

## Architecture

### 1. Database Layer
**File**: `db_add_master_prompt.sql`
- Adds `master_prompt` column to `app_settings` table
- Stores the tone-setting prompt that applies globally

**To apply the migration:**
```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS master_prompt TEXT DEFAULT '';
```

### 2. Settings Service
**File**: `src/lib/services/settings.ts`
- Updated `AppSettings` interface to include `master_prompt` field
- Automatically fetched with other settings

### 3. Cache Service
**File**: `src/lib/services/masterPromptCache.ts`
- In-memory cache for the master prompt
- Cache duration: 1 hour
- Methods:
  - `get()` - Retrieve cached prompt
  - `set(prompt)` - Store prompt in cache
  - `clear()` - Clear the cache
  - `isValid()` - Check if cache is still valid

### 4. Client-Side (Chat Page)
**File**: `src/app/chat/page.tsx`
- Fetches master prompt from settings on login
- Caches it using `masterPromptCache.set()`
- Console logs when master prompt is cached

**Flow:**
```
User Logs In → Settings Loaded → Master Prompt Cached → Available for Session
```

### 5. Server-Side (Chat API)
**File**: `src/app/api/chat/route.ts`
- Retrieves master prompt from database settings
- Prepends it to all system prompts before sending to AI
- Ensures consistent tone across all interactions

**Prompt Structure:**
```
[Master Prompt]

[Current Date]

[System Prompt or RAW Mode Prompt]

[User Context (Chart Data, etc.)]
```

### 6. Admin Dashboard
**File**: `src/app/admin/dashboard/page.tsx`
- New "Master Prompt" section in the "Intelligence" tab
- Highlighted with gradient background for visibility
- Separate from System Prompt for clarity
- Save button to update the master prompt

**UI Features:**
- Gradient indigo/purple background
- Sparkles icon for visual distinction
- Descriptive subtitle: "Sets the tone for all AI interactions (cached on login)"
- Dedicated save button

## Usage

### For Admins:
1. Navigate to Admin Dashboard → Intelligence tab
2. Find the "Master Prompt" section at the top
3. Enter your tone-setting prompt (e.g., "You are Parihaaram AI, a wise and compassionate Vedic astrology expert...")
4. Click "Save Master Prompt"
5. The prompt will be applied to all new user sessions

### For Users:
- The master prompt is automatically cached when they log in
- No action required - it works transparently
- Sets the tone for all their AI interactions during the session

## Example Master Prompts

### Warm & Compassionate:
```
You are Parihaaram AI, a wise and compassionate Vedic astrology expert. 
Speak with warmth, clarity, and depth. Your goal is to provide meaningful 
insights that empower users to make informed decisions about their lives.
```

### Professional & Precise:
```
You are a professional Vedic astrology consultant. Provide accurate, 
data-driven insights based on planetary positions and dashas. Maintain 
a professional yet approachable tone.
```

### Spiritual & Philosophical:
```
You are a spiritual guide versed in Vedic wisdom. Connect astrological 
insights with deeper philosophical meanings. Help users understand the 
karmic patterns and spiritual lessons in their charts.
```

## Benefits

1. **Consistent Tone**: All AI responses maintain the same personality
2. **Easy Updates**: Change the tone globally without modifying code
3. **Performance**: Cached on login for fast access
4. **Flexibility**: Separate from system prompt for different purposes
5. **Admin Control**: Non-technical admins can adjust AI personality

## Technical Details

### Cache Behavior:
- **Duration**: 1 hour (3600 seconds)
- **Scope**: Per browser session
- **Refresh**: Automatic on settings reload
- **Fallback**: If cache expires, fetches from DB on next API call

### Prompt Priority:
1. Master Prompt (sets overall tone)
2. Current Date
3. System Prompt (specific instructions)
4. User Context (chart data, profiles)

## Testing

### Test the Implementation:
1. Set a master prompt in Admin Dashboard
2. Log in as a regular user
3. Check browser console for: `[Master Prompt] Cached on login: ...`
4. Start a chat and verify the AI's tone matches the master prompt
5. Check server logs for: `[Master Prompt] Applied to system prompt`

### Verify Database:
```sql
SELECT master_prompt FROM app_settings LIMIT 1;
```

## Troubleshooting

### Master Prompt Not Applied:
- Check if `master_prompt` column exists in `app_settings` table
- Verify the prompt is saved (check Admin Dashboard)
- Clear browser cache and log in again
- Check server logs for errors

### Cache Not Working:
- The cache is in-memory and clears on page refresh
- This is expected behavior - it reloads on next login
- For persistent caching, consider using localStorage (future enhancement)

## Future Enhancements

1. **Persistent Cache**: Use localStorage for cross-session persistence
2. **Multiple Prompts**: Different master prompts for different user types
3. **A/B Testing**: Test different tones and measure engagement
4. **Version History**: Track changes to master prompt over time
5. **Preview Mode**: Test master prompt before applying globally

## Files Modified

1. `/src/lib/services/settings.ts` - Added master_prompt to interface
2. `/src/lib/services/masterPromptCache.ts` - New cache service
3. `/src/app/chat/page.tsx` - Cache master prompt on login
4. `/src/app/api/chat/route.ts` - Apply master prompt to all requests
5. `/src/app/admin/dashboard/page.tsx` - Admin UI for managing master prompt
6. `/db_add_master_prompt.sql` - Database migration

## Summary

The Master Prompt feature provides a powerful way to set the tone for all AI interactions in your application. It's cached for performance, easy to manage through the admin dashboard, and automatically applied to every AI request. This ensures a consistent, high-quality user experience across your entire platform.
