# Deploying the frontend to Netlify

This file explains how to deploy the frontend (Vite + React) to Netlify. The repository contains a `frontend/` folder which is a standard Vite app.

Prerequisites
- A Netlify account (https://app.netlify.com)
- Your project repository connected to Git (GitHub/GitLab/Bitbucket)

Steps (recommended)
1. Commit and push your changes to the repository's `main` branch (or a branch you want to deploy).
2. In Netlify, click "Add new site" → "Import an existing project" and connect your Git provider.
3. Select the repository and the branch to deploy.
4. In the "Build settings" panel use:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (under Site settings → Build & deploy → Environment):
   - `VITE_API_URL` — point this to your backend API URL (for example: `https://api.example.com`).
   - Any other `VITE_` prefixed variables your frontend relies on.

Note about backend
- Netlify hosts frontend static sites. Your backend (Express) should be hosted elsewhere (Render, Vercel serverless functions, AWS, Azure, Heroku, etc.).
- Configure the backend URL above in `VITE_API_URL` so the frontend can call your API.

Local testing
```powershell
cd frontend
npm install
npm run build
npm run preview
# preview serves the production build on http://localhost:5173 by default
```

Redirects and SPA behavior
- `frontend/netlify.toml` contains a rule that rewrites all client-side routes to `/index.html` so your SPA routes work correctly.
- It also includes a placeholder redirect for `/api/*` to your backend. Update that in `netlify.toml` or configure a custom domain / proxy in Netlify if required.

Security
- Never commit your secrets (database credentials, API keys) to the repo. Use Netlify's environment variable settings.

If you want, I can:
- Add a GitHub Action to automatically deploy the frontend to Netlify via Netlify CLI.
- Provide step-by-step instructions to host the backend (Render/Heroku) and then update the `netlify.toml` or Vite env variables.

*** End of file
