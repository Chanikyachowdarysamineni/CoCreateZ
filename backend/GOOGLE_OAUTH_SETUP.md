# Google OAuth Setup

This project supports Google OAuth for login.

Required environment variables (add to `.env`):

- GOOGLE_CLIENT_ID - Google OAuth client ID
- GOOGLE_CLIENT_SECRET - Google OAuth client secret
- GOOGLE_REDIRECT_URI - The redirect URI configured in Google Console. Example: `https://yourdomain.com/api/auth/google/callback` or `http://localhost:4000/api/auth/google/callback` for local testing
- FRONTEND_URL - frontend base URL (used for redirect back to client)

How it works:
1. User visits `/api/auth/google` which will redirect to Google's OAuth consent screen.
2. Google redirects back to `/api/auth/google/callback` with a code.
3. Server exchanges the code for tokens, fetches userinfo, upserts a user record, creates a JWT, and redirects the browser to the frontend with the token in query string.

Security notes:
- For production, configure HTTPS redirect URIs and restrict OAuth client to your domain.
- Consider storing refresh tokens securely if you need long-lived access to Google APIs.
- Avoid sending tokens in query strings for production; instead set cookies or use a safer redirect flow.
