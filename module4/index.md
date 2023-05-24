# Module 4

This module covers setting up Twitter authentication for this application which acts as one of the last few steps in closing the loop, from generating your the blurb and running plagarism checks to finally posting the Tweet.

---

## Contents

4.1 [Twitter Auth Configuration](#twitter-auth-configuration)
<br>
4.1.1 [Signing up for Twitter Dev Account](#signing-up-for-twitter-dev-account)
<br>
4.1.2 [Setting Up Twitter API Consumer & Client Keys](#setting-up-twitter-api-consumer--client-keys)
<br>
4.2 [NextJS API](#nextjs-api)
<br>
4.3 Frontend

---

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

---

## NextJS API

In order to call the the Tweet function we need to create an API.

### Tweet API

**Create a Tweet Post API**

1. Create an Edge function named `tweetPost.ts`.
2. Obtain and validate the JWT Token from the request (https://next-auth.js.org/configuration/options#jwt-helper)
3. Validate the incoming request Body
4. Post Tweet using the Twitter API (https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
5. Deploy your API

<details>
  <summary>Solution</summary>

1. Create a file named `tweetPost.ts` in `pages/api`.
2. Create a handler which takes a `req` parameter.
3. Obtain and validate the JWT token from the request.
4. Validate the incoming request Body.
5. Post Tweet using the Twitter API.
6. Push your code to main to deploy your API.

```ts
import { NextApiRequest, NextApiResponse } from "next";

import { getEnvs } from "./utils";
import { getToken } from "next-auth/jwt";

const env = getEnvs("NEXTAUTH_SECRET");

type TweetRequest = {
  message: string;
};
/*
    Given Twitter has been authenticated
    And a TweetRequest has been provided
    Then post the tweet to Twitter
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate Token
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      throw new Error("Not authorised, please login to Twitter first");
    }
           
    // Validate Request
    const body = JSON.parse(req.body) as TweetRequest;
    if (!body.message) {
      throw new Error("No message provided");
    }

    // Post Tweet
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: body.message,
      }),
    });

    const details = await response.json();
    res.status(response.ok ? 201 : 400).send(details);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};

```
</details>
<br>

---


## Frontend

Finally, let's start creating the UI to show the user what their tweet will look like and before posting it to Twitter.

### Tweet Preview

