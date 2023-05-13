# Module 4

This module covers setting up Twitter authentication for this application which acts as one of the last few steps in closing the loop, from generating your the blurb and running plagarism checks to finally posting the Tweet.

## Twitter Auth Configuration

In order to hook up Twitter with our application, we need a developer account and some consumer keys. Follow the steps below on how to setup if you have not already done so.

### Signing up for Twitter Dev Account

1. Login to your Twitter account
2. Create twitter developer account. Navigate to https://developer.twitter.com/en/portal/petition/essential/basic-info. This is the development account registration page.
3. Sign up for free account. 250 Character use case textbox has to be filled in before you can create a new account. Just enter anything in here and Twitter should automatically provision one for you. Once provisioned you will be on the Free Plan which means 1500 tweets a month and 50 tweets every 24 hours max.

**Note** free account access is limited to ONLY the following endpoints:

1. POST /2/tweets
2. GET /2/users/me
3. DELETE /2/tweets

See https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api for more details.

### Setting Up Twitter API Consumer & Client Keys

1. Navigate to the Twitter dev dashboard: https://developer.twitter.com/en/portal/dashboard
2. Scroll down to the `Apps` section and click on the button `+ Add App`. Then enter in a name and hit the next button
3. This should create an application. Proceed by clicking on `App Settings` button as we now need to configure oauth2
4. Under the section `User authentication settings` and click on `Set Up` button. Next do the following:  
   a. Set App permissions to `Read and write`  
   b. Type of App to `Web App`  
   c. Callback URI to `http://127.0.0.1:3000/api/auth/callback/twitter`. This is because localhost is not accepted here as a valid callback.
   d. Website URL to i.e. (http://example.com). It doesn't really matter for local development and prorotyping
5. Click on the save button and you will be taken to a page with your client ID and client secret. Copy these values down and store somewhere safe as these keys will be required for the `.env.local` file for local development.
6. Lastly, we need to set a value for `NEXTAUTH_SECRET` env variable used by nextauth.js library which is used to encrypt and decrypt JWT tokens. See here for more documentation on generating a good value: https://next-auth.js.org/configuration/options