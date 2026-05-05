# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### OAuth Providers Setup

1. **Google OAuth**
   - Go to Supabase Dashboard > Authentication > Providers > Google
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL: `https://clauseit.vercel.app/auth/callback`

2. **GitHub OAuth**
   - Go to Supabase Dashboard > Authentication > Providers > GitHub
   - Enable GitHub provider
   - Add your GitHub OAuth credentials
   - Set redirect URL: `https://clauseit.vercel.app/auth/callback`

### OpenAI Configuration
```bash
OPENAI_API_KEY=your_openai_api_key
```

### Production Environment
```bash
NODE_ENV=production
```

## Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

1. Go to Project Settings > Environment Variables
2. Add all the variables above
3. Make sure to select the appropriate environments (Production, Preview, Development)

## OAuth Redirect URLs

Ensure your OAuth providers have the following redirect URLs configured:

**Production:**
- `https://clauseit.vercel.app/auth/callback`

**Development:**
- `http://localhost:3000/auth/callback`

## Authentication Flow

1. **New Users**: Redirected to onboarding after first login
2. **Existing Users**: Redirected to dashboard
3. **OAuth Providers**: Google and GitHub are supported
4. **Magic Links**: Email-based authentication is also available
