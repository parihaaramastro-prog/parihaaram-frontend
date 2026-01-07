# How to Fix "Sign in to ...supabase.co" in Google OAuth

The message "Sign in to [supabase-url]" appears because Google identifies the application by the domain of the redirect URI (which is currently your Supabase project URL) or because the OAuth Consent Screen hasn't been fully configured with your App Name.

## Step 1: Update Google Cloud Console (Free & Essential)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project.
3.  Navigate to **APIs & Services** > **OAuth consent screen**.
4.  Click **Edit App**.
5.  **App Information**:
    *   **App name**: Change this to "Parihaaram" (or your desired name).
    *   **User support email**: Select your email.
    *   **App logo**: Upload your logo (optional but recommended).
6.  **App Domain**:
    *   Fill in your Application Home Page (e.g., `http://localhost:3000` for dev, or your real domain `https://parihaaram.com`).
    *   **Authorized Domains**: Add `supabase.co` (since you are using it for auth) and your own domain.
7.  Save and Continue.

## Step 2: Verification (Production Only)

For the name to appear reliably to all users without warnings:
1.  If you are deploying to production (e.g., Vercel), you usually need to verify your domain ownership in **Google Search Console**.
2.  Once verified, Google will display the App Name instead of the URL.

## Step 3: Custom Domain (Supabase Pro Feature)

If you want to completely hide the `supabase.co` URL from the browser bar during redirect:
1.  You need to set up a **Custom Domain** in Supabase (e.g., `auth.parihaaram.com`).
2.  This requires a paid Supabase plan.
3.  Once set up, you would update the **Authorized Redirect URI** in Google Cloud Console to `https://auth.parihaaram.com/auth/v1/callback`.

## Summary
For now, simply **renaming the App** in the OAuth Consent Screen (Step 1) should improve the display, although Google might still show the domain if it considers the app "unverified". This is expected behavior during development.
