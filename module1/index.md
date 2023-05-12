# Module 1

How to build a hello world application on nextjs and deploy it using Vercel:

## Deployment

Vercel is a PaaS company built on top of AWS.

### Setting Up Vercel

1. Go to https://vercel.com/
2. Click on the `Sign Up` button
3. Select `Hobby`. Enter your name. Click Continue
4. Click `Continue with GitHub`
5. Authorise Vercel to connect to your GitHub account
6. Click `Import` next to your Git repository
7. Click on the `Build and Output Settings` accordion.
8. Under `Build Command`, enable the override toggle and enter `pnpm build`
9. Under `Install Command`, enable the override toggle and enter `pnpm install`
10. Under Environment Variables enter the environment variables and their values found in your `.local.env`. Which are the following:

- `OPENAI_API_KEY`
- `COPY_LEAKS_EMAIL`
- `COPY_LEAKS_API_KEY`
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL`

11. Click `Deploy`
12. Once the application has been deployed, click on the image below `Continue to Dashboard` to view your deployed application
