# Module 4

This module covers setting up Twitter authentication for this application which acts as one of the last few steps in closing the loop, from generating your the blurb and running plagarism checks to finally posting the Tweet.

</br>

## Contents

4.1 [Twitter Auth Configuration](#twitter-auth-configuration)
</br>
4.2 [NextJS APIs](#nextjs-apis)
</br>
4.3 [Configure NextAuth](#configure-nextauth)
</br>
4.4 [Frontend](#frontend)
</br>

</br>

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

</br>

## NextJS APIs

In order to tweet your post to Twitter, we need to create a NextJS API which will be called by the frontend. This API will be responsible for posting the tweet to Twitter.

### Tweet API

**Create a Tweet Post API**

1. Install the `next-auth` package
2. Create an Edge function named `tweetPost.ts`.
3. Obtain and validate the user's authentication (JWT) from the request (https://next-auth.js.org/configuration/options#jwt-helper)
4. Validate the incoming request Body
5. Post Tweet using the Twitter API (https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
6. Deploy your API

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

import { getToken } from "next-auth/jwt";

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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
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

</br>

### Configure NextAuth

Now that we've setup our Twitter API, we need to configure NextAuth to use Twitter as an authentication provider.
NextAuth is a library that abstracts away the complexity of authentication and provides a simple API for us to use. It also provides a number of authentication providers out of the box which we can use. In this case, we will be using Twitter as our authentication provider.

NextAuth is configured in the `pages/api/auth/[...nextauth].ts` file. This file is a dynamic route which means it will match any route that starts with `/api/auth/` and then anything after that. This is useful as it allows us to create multiple authentication providers in the same file. For example, we could have a Twitter and Facebook authentication provider in the same file.

Authentication is important as it allows us to identify the user and also obtain an access token which we can use to make API calls on behalf of the user. In this case, we will be using the Twitter API to post a tweet on behalf of the user.

Outline:

1. Create a catch-all dynamic route named `[...nextauth].ts` in `pages/api/auth`<br />
2. Configure NextAuth to use Twitter (https://next-auth.js.org/providers/twitter)<br />
3. Ensure scope is set to `"users.read tweet.read tweet.write offline.access"` so the user's token will have access to get the user's Profile Picture, name and email as well as being able to write tweets<br />

- "users.read" - allows us to get the user's profile picture, name and email<br />
- "tweet.read" - allows us to read tweets<br />
- "tweet.write" - allows us to write tweets<br />
- "offline.access" - allows us to obtain a refresh token which can be used to obtain a new access token when the current one expires<br />

4. Bind the Twitter Provider to the NextAuth configuration<br />

Learn more about NextJs Dynamic Routes (ie. [...nextauth]): https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes
Learn NextAuth: https://next-auth.js.org/getting-started/introduction

<details>
  <summary>Solution</summary>

```ts
import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

// File naming: the brackets [ define our API route as a parameter (or variable) and the ... tells Next.js that there can be more than one parameter

const twitterProvider = TwitterProvider({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  authorization: {
    url: "https://twitter.com/i/oauth2/authorize",
    params: {
      scope: "users.read tweet.read tweet.write offline.access",
    },
  },
  version: "2.0",
});

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ account, token }) {
      if (account) {
        token.refresh_token = account.refresh_token;
        token.access_token = account.access_token;
      }

      return token;
    },
  },
  providers: [twitterProvider],
});
```

</details>

</br>

## Frontend

Finally, let's start creating the UI to show the user what their tweet will look like before posting it to Twitter.

### Login / Logout with Twitter

Outline:

UI

1. Create a file named `SigninToolbar.tsx` in `components`<br />
2. Create a component named `SigninToolbar` which uses the `useSession` hook from next-auth to determine if the user is logged in or not<br />
3. Add the `SigninToolbar` component to the `Home` page<br />

<details>
  <summary>Solution</summary>

```ts
// components/SigninToolbar.tsx
import { Box, Button } from "@mui/material";
import { useSession } from "next-auth/react";
import * as React from "react";

export default function SigninToolbar() {
  const { data: session, status } = useSession();

  return (
    <Box position="absolute" top="1em" right="1em">
      {status === "authenticated" ? "Logged in" : "Logged Out"}
    </Box>
  );
}
```

</details>
<br>

Login

1. If the user is not logged in, show a login button<br />
2. The login button should call the `signIn` function from next-auth (https://next-auth.js.org/getting-started/example#frontend---add-react-hook)<br />

<details>
  <summary>Solution</summary>

```ts
// components/SigninToolbar.tsx
import { Box, Button } from "@mui/material";
import { useSession, signIn } from "next-auth/react";
import * as React from "react";

function UnauthenticatedContent() {
  return (
    <Button
      variant="contained"
      size="medium"
      color="primary"
      onClick={() => {
        signIn("twitter", {
          callbackUrl: process.env.NEXTAUTH_URL,
        });
      }}
    >
      Login With Twitter
    </Button>
  );
}

export default function SigninToolbar() {
  const { data: session, status } = useSession();

  return (
    <Box position="absolute" top="1em" right="1em">
      {status === "authenticated" ? "Logged in" : <UnauthenticatedContent />}
    </Box>
  );
}
```

</details>
<br>

Logout

1. If the user is logged in, show a welcome message and a logout button<br />
2. The logout button should call the `signOut` function from next-auth (like you did in the Login step)<br />

<details>
  <summary>Solution</summary>

```ts
import { Box, Button } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import * as React from "react";

function AuthenticatedContent({ username }: { username?: string | null }) {
  return (
    <div>
      <span className="mr-3">
        Welcome <b className="text-green-500">{username}!</b>
      </span>

      <Button
        variant="contained"
        size="medium"
        color="primary"
        onClick={() => {
          signOut({ redirect: true });
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}

function UnauthenticatedContent() {
  return (
    <Button
      variant="contained"
      size="medium"
      color="primary"
      onClick={() => {
        signIn("twitter", {
          callbackUrl: process.env.NEXTAUTH_URL,
        });
      }}
    >
      Login With Twitter
    </Button>
  );
}

export default function SigninToolbar() {
  const { data: session, status } = useSession();

  return (
    <Box position="absolute" top="1em" right="1em">
      {status === "authenticated" ? (
        <AuthenticatedContent username={session.user?.name} />
      ) : (
        <UnauthenticatedContent />
      )}
    </Box>
  );
}
```

</details>
<br>

Test

1. Deploy your changes<br />
2. Login with Twitter<br />
3. Logout<br />
4. Login again<br />

### Tweet Preview and Post

Outline:

UI

1. Create a TweetPreview Dialog component<br />

Posting

1. Create a button to tweet your blurb to the new tweetPost API<br />
2. Close the Dialog on success and show a success message<br />

Error Handling

1. Handle the response from the API<br />
2. Show an error on error<br />

<details>
  <summary>Solution</summary>

1. Create a file named `TweetPreview.tsx` in `components/TweetPreview`.
2. Install the `mui/icons-material/Twitter` package
3. The component should declare a `blurb` parameter which gets injected by the Higher-ordered-Component, HoC. Higher-ordered-Components are parent components that wrap child components and inject props into them. In this case, the HoC is the `Home` component and the child component is the `TweetPreview` component.
4. The component should have 4 states to manage:
   <br />`editableBlurb` should be initialised with the blurb parameter. It's purpose is to allow the user to edit the blurb in the preview itself.
   <br /><br />`loading` should be initialised with `false`. It's purpose is to show a loading indicator when the user clicks the tweet button.
   <br /><br />`showDialog` should be initialised with `false`. It's purpose is to show the dialog when the user clicks the tweet button; likewise hide the Dialog when the user clicks the close button.
   <br /><br />`error` should be initialised with `undefined`. It's purpose is to show an error message when the API call fails.

5. Tweet Handler should be async and do the following:
   <br />a. Set loading to true
   <br />b. Set error to undefined
   <br />c. Call the `tweetPost` API you created earlier with the `editableBlurb` value
   <br />d. If the API call fails, set error to the error message
   <br />e. If the API call succeeds, close the Dialog and show a success message
   <br />f. Set loading to false
   <br />**NOTE: On success, this will publish to your Twitter account!**

```ts
import "react-circular-progressbar/dist/styles.css";

import TwitterIcon from "@mui/icons-material/Twitter";
import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { CenterBox } from "../CenterBox";
import { ProfilePicture } from "./ProfilePicture";
import { toast } from "react-hot-toast";

export const TweetPreview = ({ blurb }: { blurb: string }) => {
  const [editableBlurb, setEditableBlurb] = useState(blurb);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string>();

  const tweet = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const res = await fetch("/api/tweetPost", {
        method: "POST",
        body: JSON.stringify({
          message: blurb,
        }),
      });

      const errors = (await res.json()).errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors[0].message);
      } else {
        toast("Tweet Posted!");
        setShowDialog(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TwitterIcon
        className="cursor-pointer"
        onClick={() => setShowDialog(true)}
      />
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        fullWidth
        sx={{ maxWidth: 600, mx: "auto" }}
      >
        <DialogTitle>Tweet Preview</DialogTitle>
        <DialogContent sx={{ position: "relative" }}>
          {loading && (
            <CenterBox
              sx={{
                backgroundColor: "white",
                zIndex: 1,
                opacity: 0.5,
              }}
            >
              <CircularProgress color="primary" />
            </CenterBox>
          )}
          <Stack direction="row">
            <ProfilePicture />
            <Box width={"100%"}>
              {error && <p className="text-red-500">{error}</p>}
              <TextField
                fullWidth
                minRows={4}
                multiline
                onChange={(e) => setEditableBlurb(e.target.value)}
                sx={{ "& textarea": { boxShadow: "none !important" } }}
                value={editableBlurb}
                variant="standard"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={loading}>
            Close
          </Button>
          <Button
            onClick={tweet}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            Tweet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

</details>

### Create a ProfilePicture component

1. Create a file named `ProfilePicture.ts` in `components/TweetPreview`.
2. The component should show the logged in user's profile picture (https://next-auth.js.org/getting-started/client). Since we're using Twitter, we can use the `image` property from the session object.
3. The component should be a circular image with a height of 3em and a margin-right of 1em.
4. The component should be important from `TweetPreview.ts` and used in the Dialog.

<details>
  <summary>Solution</summary>

```ts
import { useSession } from "next-auth/react";

export const ProfilePicture = () => {
  const { data: session } = useSession();
  const twitterImage = session?.user?.image;

  return (
    <>
      {twitterImage && (
        <img
          src={twitterImage}
          alt="User's Twitter Profile Picture"
          style={{
            height: "3em",
            width: "auto",
            borderRadius: "50%",
            marginRight: "1em",
          }}
        />
      )}
    </>
  );
};
```

</details>
