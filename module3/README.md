# Module 3

In this module we learn how to check your blurb for plagiarism using the CopyLeaks API, Firebase Realtime Database and Webhooks.
</br>

![Plagiarism Flow](../module3/imgs/PlagiarismFlow.png)

The flow for a plagiarism check is as follows:

1. The frontend calls our Next.js `plagiarismCheck` API with some text to be checked. A `scanId` is returned. We then listen to Firebase for any changes on the node `scan/[scanId]`.
2. This text is then passed to an online plagiarism detection tool(CopyLeaks).
3. Once the plagiarism check has completed it sends high level details of the results to our `pages/api/copy-leaks/completed/[scanId]` Webhook. **It can take up to two minutes before we receive these results.**
4. When we receive the high level results in our `pages/api/copy-leaks/completed/[scanId]` Webhook. We do the following:

- We write the scan results to Firebase. Once our listener, mentioned in step 1, gets notified of this change we then calculate the plagiarism score based off this data.
- We find the source within the results which has the highest amount of suspected plagiarism and pass it to the plagiarism detection tool `exportResults` API.

5. The plagiarism detection tool(CopyLeaks) `exportResults` API gives us further information about a particular source such as which words in our text it thinks were plagiarised. Once the plagiarism detection tool has finished exporting the results of a source it sends the low level details of the results to our `pages/api/copy-leaks/export/[scanId]/[resultId]` Webhook. **It can take up to a minute before we receive these results**.
6. When we receive the results in our `pages/api/copy-leaks/export/[scanId]/[resultId]` Webhook. We do the following:

- We write the results to Firebase.
- Once our listener, mentioned in step 1, gets notified of this change we highlight which words in our blurb were plagiarised based off this data.

---

## Contents

3.1 [Plagiarism UI](#31-plagiarism-ui)
</br>
3.2 [Verify UI with Dummy Values](#32-verify-ui-with-dummy-values)
</br>
3.3 [Webhooks](#33-webhooks)
</br>
3.4 [Writing a Firebase Library](#34-writing-a-firebase-library)
</br>
3.5 [Validate Webhooks in the UI Using Firebase](#35-validate-webhooks-in-the-ui-using-firebase)
</br>
3.6 [Next.js Plagiarism Check API](#36-nextjs-plagiarism-check-api)
</br>
3.7 [Hookup API to Frontend](#37-hookup-api-to-frontend)

---

## 3.1 Plagiarism UI

Firstly, let's start creating the UI to show our plagiarism results.

### Tasks

Ensure you are running `pnpm dev` before solving the next tasks.

**3.1.1 Plagiarism Progress Bar**

**Step 1:** Before we add the progress bar, we have to add a new component called `CenterBox` that allows you to keep your elements in the middle.

<details>
  <summary>Solution</summary>

Under your `components` folder create a new file called `centerBox.tsx` and copy the code below into it.

```ts
import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";

export default function CenterBox({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps;
}) {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
```

</details>
</br>

**Step 2:** Now let's add another component for our progress bar. Write a component called `loading.tsx` in the `components` folder. You will need MUI's `CircularProgress` component for this

<details>
  <summary>Solution</summary>

1. In the `components` folder, add a file named `loading.tsx`
   1. This will return muis `CircularProgress` component.
   2. Underneath this component add the text `Analysing Plagiarism`

```ts
import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress size="4em" />
      </Box>
      <Box paddingTop="0.5em" textAlign="center">
        Analysing Plagiarism
      </Box>
    </>
  );
}
```

</details>
</br>
It should look like this:

![Loading](../module3/imgs/Loading.png)

</br>

**Step 3:** In the `components` folder, add a new component named `score.tsx`

1.  This function will take a `value` number variable and a `label` string variable as parameters.
2.  Use Mui's `CircularProgress` component with the `determinate` variant with the `value` property set to `value`.
3.  Underneath this component add the text in `label`

<details>
  <summary>Solution</summary>

```ts
import * as React from "react";

import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";
import CenterBox from "./centerBox";
import Typography from "@mui/material/Typography";

export default function Score(
  props: CircularProgressProps & { value: number; label: string }
) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box width="100%" display="inline-flex" position="relative">
        <CircularProgress
          variant="determinate"
          value={props.value}
          color="secondary"
          size="4em"
        />
        <CenterBox>
          <Typography variant="caption" component="div" color="text.secondary">
            {props.label}
          </Typography>
        </CenterBox>
      </Box>
    </Box>
  );
}
```

</details>
</br>
It should look like this:

![Loading](../module3/imgs/Score.png)

**Step 4:** In the `components` folder, add a file named `plagiarism.tsx`

1.  This function will take a `loading` boolean variable and a `score` number variable as parameters.
2.  If `loading` is true we will show our `Loading` component.
3.  If `loading` is false we will show our `Score` component.

<details>
  <summary>Solution</summary>

```ts
import { Box } from "@mui/material";
import Loading from "./loading";
import Score from "./score";

interface Props {
  loading: boolean;
  score?: number;
}

export default function Plagiarism({ loading, score }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <Loading />
      ) : (
        typeof score === "number" && (
          <Score value={score} label={`${Math.round(score)}%`} />
        )
      )}
    </Box>
  );
}
```

</details>
</br>

**Step 5:** In `blurb.tsx` component

1.  Add a boolean state variable named `plagiarismLoading` with the default value of false.
2.  Add a number state variable named `plagiarisedScore` with the default value of 0.
3.  At the bottom of the HTML `Stack` add the `Plagiarism` component with the `loading` property having the value `plagiarismLoading` and the `score` property having the value `plagiarisedScore`.

Your `blurb.tsx` should look like this:

<details>
  <summary>Solution</summary>

```ts
import { Card, CardContent, Stack } from "@mui/material";
import Plagiarism from "./plagiarism";
import { useState } from "react";

interface Props {
  generatingPost: string;
}

export default function Blurb({ generatingPost }: Props) {
  const [plagiarismLoading, setPlagiarismLoading] = useState<boolean>(false);
  const [plagiarisedScore, setPlagiarisedScore] = useState<number>(0);
  return (
      <Stack direction="row" spacing="1em">
        <Card sx={{ width: "37em" }}>
          <CardContent>{generatingPost}</CardContent>
        </Card>
        <Stack
          alignItems="center"
          justifyContent="center"
          width="12em"
          className="bg-white rounded-xl shadow-md p-4 border"
        >
          <Plagiarism loading={plagiarismLoading} score={plagiarisedScore} />
        </Stack>
      </Stack>
  );
}
```

</details>
</br>

**3.1.2 Add Plagiarism Score Column Name**

In `index.tsx`, add the heading `Plagiarism Score` above the plagiarism score components.

<details>
  <summary>Solution</summary>

Your `index.tsx` should look like this:

```ts
...
      {generatingPosts && (
        <>
          <Stack direction="row-reverse" width="100%">
            <Typography width="12em" textAlign="center">
              Plagiarism Score
            </Typography>
          </Stack>
          {generatingPosts
            .substring(generatingPosts.indexOf("1.") + 3)
            .split(/2\.|3\./)
            .map((generatingPost, index) => {
              return (
                <Blurb key={index} generatingPost={generatingPost}></Blurb>
              );
            })}
        </>
      )}
...

```

</details>
</br>

Your final component should look like this:

![AnalysingPlagiarism](../module3/imgs/AnalysingPlagiarism.png)

---

## 3.2 Verify UI with Dummy Values

Before we write our APIs, lets use some dummy objects to validate our changes. This will allow us to avoid using time consuming APIs and provide us with quicker feedback. Let's assume for now that our database already has results. We will work backwards starting from step 6 in our flow mentioned at the top of this page.
</br>

**3.2.1 Check For Plagiarism When Blurb Has Finished Generating**

We should only check for plagiarism once all the blurbs have finished generating.

Create a boolean state variable in `index.tsx` that tracks if all the blurbs have finished generating. Then pass this value as a `prop` to the `Blurb` component.

<details>
  <summary>Solution</summary>

```diff
...
+ const [blurbsFinishedGenerating, setBlurbsFinishedGenerating] = useState<boolean>(false);
...

  const generateBlurb = useCallback(async () => {
+  setBlurbsFinishedGenerating(false);
  ...
  while(!done){
    ...
  }

+  setBlurbsFinishedGenerating(true);

  ...
  <Blurb
  key={index}
  generatingPost={generatingPost}
+  blurbsFinishedGenerating={blurbsFinishedGenerating}
  ></Blurb>
  ...
```

Now let's update your Blurb component in `Blurb.tsx` to also reflect the new prop.

```ts
...
interface Props {
  generatingPost: string;
  blurbsFinishedGenerating: boolean;
}

export function Blurb({ generatingPost, blurbsFinishedGenerating }: Props) {
...
```

</details>
</br>

**3.2.2 Handle Scan Results**

Now connect our frontend to display the results from some dummy backend response. To do that:

- Download the zip folder from [dummy-data](./content/utils)
- Unzip the folder
- Copy the folder into your `./utils` folder

Write a function in `blurb.tsx` that uses the dummy results file to calculate the percentage of the blurb which was plagiarised.

<details>
  <summary>Solution</summary>

1. In `blurb.tsx` create a function called `handleScan` which takes a `text` string variable as a parameter and a `scan` object parameter.
2. Calculate the total number of words in our blurb by doing a `string.split()` on our blurb and finding the length of this array.
3. Get the total number of `matchedWords` from our scan.
4. Set the `plagiarisedScore` to be `(matchedWords/totalWords) * 100` .

   ```ts
   ...
   const [plagiarismLoading, setPlagiarismLoading] = useState<boolean>(false);
   const [plagiarisedScore, setPlagiarisedScore] = useState<number>(0);

   function handleScan(text: string, scan: any) {
     const totalBlurbWords = text.split(" ").length;
     const matchedWords = scan.matchedWords;
     setPlagiarisedScore((matchedWords / totalBlurbWords) * 100);
   }
   ...
   ```

5. In `checkPlagiarism` set `plagiarismLoading` to be true.
6. In `checkPlagiarism` assign a variable called `scan` to have the value of our dummy object.
7. In `checkPlagiarism` call `handleScan` and set `plagiarismLoading` to be false.

   ```ts
   import dummyScanResults from "../../utils/dummy-data/dummyScanResults.json";
   ...
     const checkPlagiarism = async (streamedBlurb: string) => {
       setPlagiarismLoading(true);
       const scan = dummyScanResults;
       handleScan(streamedBlurb, scan);
       setPlagiarismLoading(false);
     };

     function handleScan(text: string, scan: any) {
   ...
   ```

</details>
</br>

**3.2.3 Using useEffect to Call checkPlagiarism**

Next step we would like to store the final blurb value after it has finished streaming. To do this we are using react `useEffect` which essentially only effect the block of code inside the useEffect when its dependent state has been updated.

As we can only check for plagiarism once all the blurbs have finished generating. You should use `useEffect` to call our `checkPlagiarism` function while having `blurbsFinishedGenerating` as a dependency.

<details>
  <summary>Solution</summary>

Inside `components/blurb.tsx` add below snippet after your handleScan function.

```ts
...
  useEffect(() => {
    if (blurbsFinishedGenerating) {
      checkPlagiarism(generatingPost);
    }
  }, [blurbsFinishedGenerating]);
```

</details>
</br>

As this runs pretty quickly we don't actually get to see our loading spinner. Let's put a timeout for 5 seconds in our `checkPlagiarism` function to force our loading spinner to show. Your function should look like this:

```ts
const checkPlagiarism = async (streamedBlurb: string) => {
  setPlagiarismLoading(true);
  await new Promise((r) => setTimeout(r, 5000));
  const scan = dummyScanResults;
  handleScan(streamedBlurb, scan);
  setPlagiarismLoading(false);
};
```

Test your app, it should look like this:

![ScanPercentage](../module3/imgs/ScanPercentage.png)

Now that we tested that the loading spinner works. We can remove the timeout.

**3.2.4 Handle Detailed Results**

Let's extend your `handleScan` function to handle detailed results. Copy and paste this function into `blurb.tsx`. This should highlight the text in the blurb which has been plagiarised.

```ts
import { Card, CardContent, Stack, Box } from "@mui/material";
...
function getHighlightedHTMLBlurb(
  text: string,
  characterStarts: number[],
  characterLengths: number[]
) {
  let characterStartsIndex = 0;
  let highlightedHTMLBlurb = "";
  for (let i = 0; i < text.length; i++) {
    if (i == characterStarts[characterStartsIndex]) {
      const segmentStart = characterStarts[characterStartsIndex];
      const segmentEnd =
        characterStarts[characterStartsIndex] +
        characterLengths[characterStartsIndex];

      highlightedHTMLBlurb += `<mark style="background:#FF9890">${text.substring(
        segmentStart,
        segmentEnd
      )}</mark>`;

      i = segmentEnd - 1;
      characterStartsIndex = characterStartsIndex + 1;
    } else {
      highlightedHTMLBlurb += text[i];
    }
  }
  return <Box dangerouslySetInnerHTML={{ __html: highlightedHTMLBlurb }}></Box>;
}
...
```

You can check the [Copy Leaks documentation](https://api.copyleaks.com/documentation/v3/webhooks/result) for more information about how to handle detailed results of plagiarism checker.

This is what it should look like:

![BlurbHighlighting](../module3/imgs/BlurbHighlighting.png)

Now extend your `handleScan` function to use the `getHighlightedHTMLBlurb` function.

<details>
  <summary>Solution</summary>

1. Create a state variable called `highlightedHTMLBlurb` of type `JSX.Element`

   ```ts
   const [highlightedHTMLBlurb, setHighlightedHTMLBlurb] =
     useState<JSX.Element>();
   ```

2. Replace your `handleScan` function with below code

   ```ts
   function handleScan(text: string, scan: any) {
     const totalBlurbWords = text.split(" ").length;
     const matchedWords = scan.matchedWords;
     setPlagiarisedScore((matchedWords / totalBlurbWords) * 100);
     const characterStarts = scan.results.identical.source.chars.starts;
     const characterLengths = scan.results.identical.source.chars.lengths;
     const highlightedHTMLBlurb = getHighlightedHTMLBlurb(
       text,
       characterStarts,
       characterLengths
     );
     setHighlightedHTMLBlurb(highlightedHTMLBlurb);
   }
   ```

3. Change the `useEffect` hook to to set the `highlightedHTMLBlurb` to be the a HTML element with the finished Blurb as it's content

   ```ts
   useEffect(() => {
     if (blurbsFinishedGenerating) {
       checkPlagiarism(generatingPost);
       setHighlightedHTMLBlurb(<>{generatingPost}</>);
     }
   }, [blurbsFinishedGenerating]);
   ```

4. Change the HTML to show the new `highlightedHTMLBlurb` instead or the `generatingPost` only when `blurbsFinishedGenerating` is true.

   ```diff
     <Stack direction="row" spacing="1em">
       <Card sx={{ width: "37em" }}>
   -     <CardContent>{generatingPost}</CardContent>
   +     <CardContent>
   +        {!blurbsFinishedGenerating ? generatingPost : highlightedHTMLBlurb}
   +     </CardContent>
       </Card>
       <Stack
         alignItems="center"
         justifyContent="center"
         width="12em"
         className="bg-white rounded-xl shadow-md p-4 border"
       >
         <Plagiarism loading={plagiarismLoading} score={plagiarismScore} />
       </Stack>
     </Stack>
   ```

</details>
</br>

---

## 3.3 Webhooks

In order to receive the results of scans and exports from the Copy Leaks servers we need to create two webhooks. These webhooks will then write their data to our Firebase database. Before we setup our Webhooks, let's create a Firebase Realtime Database.

Firebase Realtime Database is a cloud-hosted NoSQL database provided by Google as part of the Firebase platform. It is a real-time, scalable database solution designed to store and synchronize data across multiple clients in real-time. This database will only be used to store the results from a CopyLeaks plagiarism check and then notify the front end that results have been returned.

Although our plagiarism call is not realtime, Copy Leaks API will send the response to a webhook. The webhook will then sends the response to the Firebase database and Firebase is connected to our UI to update the frontend as soon as any new data is available in the db. The main aim of this module is to show you how to connect your frontend with a realtime database and display the latest data in your application as soon as new data becomes available.

For more information on Firebase check their documentation [here](https://firebase.google.com/docs/database/web/start).

---

### 3.3.1 Creating a Firebase Realtime Database

1. Go to https://console.firebase.google.com/
2. Sign in with a Google account
3. Click on `Create Project`
4. Enter a project name - this can be anything like `latency-blurb-workshop`
5. Accept the terms and conditions and click `Continue`
6. Do not enable Google Analytics and click `Create Project`
7. Click continue
8. On the left navigation bar, select the `Build` accordion and the click on `Realtime Database`
9. Click `Create Database`
10. Select `Singapore` as your database location. Click `Next`
11. Select `Start in Test mode`. Click `Enable`
12. Copy your database URL which will be something like `https://latency-blurb-workshop-default-rtdb.asia-southeast1.firebasedatabase.app/` depending on what you named your project in step 4.
13. Add your database URL to .env.local for the variable `NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL`

### Tasks

**3.3.2.1 Create an Export Webhook**

As we are working backwards through the workflow lets first write the `export` Webhook, mentioned in step 5. The export webhook is called by CopyLeaks with which words in our blurb have been plagiarised.

In Next.js, dynamic routes allow you to create pages with dynamic content based on the values in the URL. For example, if you create a file named [id].js inside the pages directory, it will match any route that has a dynamic segment in the URL.

In our case we want a dynamic route for the `scanId` and the `exportId` as this will be constantly changing for each scan that we do.

1. Create a dynamic route Edge function named `[exportId].ts` in `pages/api/copy-leaks/export/[scanId]/` which receives the results of an export and returns a response with `{message: "Result exported successfully"}`. This should also write the results to the database using the Firebase PUT API under the node `scans/<scanId>/results.json`. We only need the object in `text.comparison`.
   </br>
   More information:

- Copy Leaks: https://api.copyleaks.com/documentation/v3/webhooks/result.
- Firebase: https://firebase.google.com/docs/database/rest/save-data#section-put

<details>
  <summary>Solution</summary>

1. Create a file named `[exportId].ts` in `pages/api/copy-leaks/export/[scanId]/`.
2. Create a handler which takes a `req` parameter.
3. Get the scan ID from the `req.url.searchParams` parameter.
4. Write the result details to the database.
5. Return the `{message: "Result exported successfully"}` as a response.

```ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

export default async function handler(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const scanId = params.get("scanId");
  const body = await req.json();

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}/scans/${scanId}/results.json`,
      {
        method: "PUT",
        body: JSON.stringify(body.text.comparison),
      }
    );
  } catch (e) {
    console.error("Error writing to Firebase database", e);
    throw e;
  }

  return NextResponse.json({ message: "Result exported successfully" });
}
```

</details>
</br>

**3.3.2.2 Create a Scan Webhook**

Now let's write the `scan` Webhook, mentioned in step 4. The `scan` webhook is called by CopyLeaks with the number of words in our blurb which have been plagiarised.

1. Create a dynamic route Edge function named `[scanId].ts` in `pages/api/copy-leaks/completed` which receives the results of a scan and returns a response with `{message: "Scan Completed"}`. This should also write the scan to the database using the Firebase PUT API under the node `scans/<scanId>.json`.

More information:

- Copy Leaks: https://api.copyleaks.com/documentation/v3/webhooks/completed.
- Firebase: https://firebase.google.com/docs/database/rest/save-data#section-put

<details>
  <summary>Solution</summary>

This webhook receives the scanned results from multiple sources, we then pickup a source with highest plagiarism found and write the number of words into firebase

1. Create a file named `[scanId].ts` in `pages/api/copy-leaks/completed`.
2. Copy below code into your webhook

```ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

type SourceResult = {
  resultId: string;
  matchedWords: number;
};

function getHighestSourceResult(
  completedScanWebhookResponse: any
): SourceResult {
  let matchedWords = 0;
  let resultId = "";
  if (completedScanWebhookResponse.results.internet.length > 0) {
    const sortedResults = completedScanWebhookResponse.results.internet.sort(
      (a: SourceResult, b: SourceResult) => a.matchedWords - b.matchedWords
    );
    const highestResult = sortedResults[0];
    resultId = highestResult.id;
    matchedWords = highestResult.matchedWords;
  }

  return {
    resultId,
    matchedWords: matchedWords,
  };
}

export default async function handler(req: NextRequest) {
  const body = await req.json();
  const scanId = body.scannedDocument.scanId;
  const matchedWords = getHighestSourceResult(body);

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}/scans/${scanId}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ matchedWords: matchedWords }),
      }
    );
  } catch (e) {
    console.error("Error writing to Firebase Database", e);
    throw e;
  }

  return NextResponse.json({ message: "Scan complete" });
}
```

</details>
</br>

---

## 3.4 Writing a Firebase Library

Before we can test our Webhooks in the frontend we first need to write a Firebase class. The Firebase class that we will be writing will be a wrapper around the Firebase SDK which we will use in the frontend to listen to events on the database.

### Tasks

**Step1:** Install the Firebase SDK Package

<details>
  <summary>Solution</summary>

1. In your terminal run `pnpm i firebase`

</details>
</br>

**Step2:** Create an empty FirebaseWrapper class

<details>
  <summary>Solution</summary>

1. Create a `lib` folder in the root directory
2. In your `lib` folder create a class named `firebaseWrapper.tsx` in a sub-folder named `firebase`.
3. In `firebaseWrapper.tsx` add the following code:

```ts
export class FirebaseWrapper {}
```

</details>
</br>

**Step3:** Write a Get Database Function

Write a function called `getInstance` that will return an instance of your database - https://firebase.google.com/docs/database/web/start#add_the_js_sdk_and_initialize

<details>
  <summary>Solution</summary>

1. Create a `public` function called `getInstance`.
2. Add a `firebaseConfig` object which has `databaseURL` as a key and a value of your Firebase URL. In 3.3.1.13, we set the environment variable `NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL` to be our database URL. With this in mind the value of our Firebase URL will be `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}`
3. Initialise the Firebase app instance with `const app = initializeApp(firebaseConfig)`
4. Get the database instance from the app instance.

Your `firebaseWrapper.tsx` should now look like this:

```ts
import { Database, getDatabase, ref } from "firebase/database";
import { initializeApp } from "firebase/app";

export class FirebaseWrapper {
  public getInstance(): Database {
    const firebaseConfig = {
      databaseURL: `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}`,
    };
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    return database;
  }
}
```

</details>
</br>

**Step4:** Convert the FirebaseWrapper Class to Return a Singleton Instance

Imagine a scenario where we have to get 3 items from our database in the frontend. With our current implementation, every time we initialise the class in the frontend we would have to initialise a new connection to the database as well. This would mean that we would have to initialise a connection to our database 3 times, this can be time-consuming and is considered bad practice.

**Singletons**

A singleton is a design pattern that restricts the number of instantiations of a class to one for the lifetime of the application. In this case every time we call the instance we would always be returned the same instance which in turn means we would not have any overheads in establishing multiple connections to the database. More information: https://refactoring.guru/design-patterns/singleton

Change `firebaseWrapper.tsx` as below to make your database a Singleton instance.

```diff
import { Database, getDatabase, ref } from "firebase/database";

import { initializeApp } from "firebase/app";

export class FirebaseWrapper {
+  private database?: Database;

  private getInstance(): Database {
    if (!this.database) {
      const firebaseConfig = {
        databaseURL: `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}`,
      };
      const app = initializeApp(firebaseConfig);
-      const database = getDatabase(app);
+      this.database = getDatabase(app);
    }

-    return database;
+    return this.database;
  }
}
```

We should also write a helper function to get a reference to the node in the database with a particular scan ID. Copy and paste the function below.

Your `FirebaseWrapper.tsx` should now look like this:

```ts
export class FirebaseWrapper {
  private database?: Database;

  public getScanReference(scanId: string) {
    return ref(this.getInstance(), `scans/${scanId}`);
  }

...
}
```

---

## 3.5 Validate Webhooks in the UI Using Firebase

Now that our Webhooks can write data to Firebase we can test their responses in the frontend. To do this we can manually call the Webhooks from the frontend, while we use Firebase to listen for events on the `scans/[scanId]` node.
Ensure to use this `scanId` `f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2` and this `7e514eabb3`

### Tasks

**3.5.1 Manually call the Scan and Export Webook**

The dummy data for this task can be found in `/utils/dummy-data/dummyCompletedExportResultsWebhookResponse.json` and `/utils/dummy-data/dummyCompletedScanWebhookResponse.json`. You should have already downloaded those previously.

1. In `blurb.tsx` in `checkPlagiarism` make a manual API call to the `scan` webhook with a fake request body.
2. In `blurb.tsx` in `checkPlagiarism` make a manual API call to the `export` webhook with a fake request body.

<details>
  <summary>Solution</summary>

```ts
  import dummyCompletedExportResultsWebhookResponse from "@/utils/dummy-data/dummyCompletedExportResultsWebhookResponse.json";
  import dummyCompletedScanWebhookResponse from "@/utils/dummy-data/dummyCompletedScanWebhookResponse.json";

...

  const checkPlagiarism = async (streamedBlurb: string) => {
    setPlagiarismLoading(true);
    const scan = dummyScanResults;
    const completedScanWebhookResponse = await fetch(
      "/api/copy-leaks/completed/f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyCompletedScanWebhookResponse),
      }
    );

    const completedExportResultsWebhookResponse = await fetch(
      "/api/copy-leaks/export/f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2/7e514eabb3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyCompletedExportResultsWebhookResponse),
      }
    );
    handleScan(streamedBlurb, scan);
    setPlagiarismLoading(false);
  };
```

</details>
</br>

**3.5.2 Listening to Firebase Events**

Now that we can send scan results and export results to the database via Webhook lets listen to Firebase for when the results are returned.

Using the Firebase SDK listen for scan results on a specific node based on `scanId`. Use Firebases `onValue` function. Remember to use the `scanId` `f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2`.
</br>
More information: https://firebase.google.com/docs/database/web/read-and-write#read_data

<details>
  <summary>Solution</summary>

1. After we get our `scanId` from our `scan` API but before we set the `plagiarismLoading` to be false in `useEffect`, instantiate a `FirebaseWrapper`.
2. Get a `scanRef` by calling `FirebaseWrapper.getScanReference(scanId)`.
3. Use Firebases `onValue` function to listen for events on our `scanRef`.
4. If the `scanRecord` does not exist, do nothing. This means that CopyLeaks has not returned the results as yet.
5. Remove the `setPlagiarismLoading(false)` line. This will now be handled by the `handleScan` function.
6. Call our `handleScan` function with the `scanRecord.val()` as a parameter.

```ts
  import { FirebaseWrapper } from "../../lib/firebase/firebaseWrapper";
  import { onValue } from "firebase/database";
  ...
  const checkPlagiarism = async (streamedBlurb: string) => {
    setPlagiarismLoading(true);

    const scanId = "f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2";
    const completedScanWebhookResponse = await fetch(
      "/api/copy-leaks/completed/f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyCompletedScanWebhookResponse),
      }
    );

    const completedExportResultsWebhookResponse = await fetch(
      "/api/copy-leaks/export/f1d0db14-c4d2-487d-9615-5a1b8ef6f4c2/7e514eabb3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyCompletedExportResultsWebhookResponse),
      }
    );

    const firebase = new FirebaseWrapper();
    const scanRef = firebase.getScanReference(scanId);
    onValue(scanRef, async (scanRecord: any) => {
      // Only continue if a <scanId> node is present in Firebase
      if (scanRecord.exists()) {
        const scan = scanRecord.val();
        handleScan(streamedBlurb, scan);
      }
    });
  };
```

7. Change our `handleScan` function to take a scan as a parameter.
   1. Remove the `setPlagiarismLoading(false)` line from the `checkPlagiarism` function.
   2. Add a check to see og there are 0 `matchedWords` if this is the case none of our blurb will be highlighted.
   3. Add a check above the assignment of the `characterStarts` variable to check if `scan.results` exists. This is because a `scan` will return before `scan.results` is in the database as we are only writing the `scan.results` node once we have the `scan` information and the time between these calls will be close to 40 seconds. See our `api/copy-leaks/completed/[scanId].ts` for more information.
   4. Add the `setPlagiarismLoading(false)` line after we receive the results from Firebase.

```ts
function handleScan(text: string, scan) {
  const totalBlurbWords = text.split(" ").length;
  const matchedWords = scan.matchedWords;
  setPlagiarisedScore((matchedWords / totalBlurbWords) * 100);
  if (matchedWords == 0) {
    setPlagiarismLoading(false);
  } else if (scan.results) {
    const characterStarts = scan.results.identical.source.chars.starts;
    const characterLengths = scan.results.identical.source.chars.lengths;
    const highlightedHTMLBlurb = getHighlightedHTMLBlurb(
      text,
      characterStarts,
      characterLengths
    );
    setHighlightedHTMLBlurb(highlightedHTMLBlurb);
    setPlagiarismLoading(false);
  }
}
```

</details>
</br>
You can now test your application and see the dummy results being returned by the Firebase database.

---

## 3.6 Next.js Plagiarism Check API

In order to call the the CopyLeaks scan function we need to create an API. Before we write our API we first need to write a library that can call the CopyLeaks API. Copyleaks is an online plagiarism detection and content verification platform. It utilizes advanced algorithms and artificial intelligence (AI) technology to compare submitted content against a vast database of sources, including web pages, academic journals, publications, and more.

**It is important to note that as this is a free account we are only entitled to 25 plagiarism checks. If you run out of credits you will have to go through this process again but with a different email address. Credits will only be used when you use the deployed version of your app. Credits will not be used in local development, in local development CopyLeaks will run in sandbox mode, this means that a valid response will be returned but the response results will contain mocked data.**

### 3.6.1 Setting Up a Copy Leaks API

1. Go to https://copyleaks.com/
2. Click on `Login`
3. Click on `Sign Up`
4. Enter an email and password
5. Verify your email address - check your junk folder for the code
6. Enter in your details - this can be anything◊
7. Go to https://api.copyleaks.com/dashboard/
8. In the `API Access Credentials` Tile click on `Generate` for one of the keys
9. Copy this key into the `COPY_LEAKS_API_KEY` variable in `.env.local`
10. Add the email address you used to sign up with to `COPY_LEAKS_EMAIL`variable in`.env.local`

### 3.6.2 Writing a CopyLeaks Library

Since that we have tested our webhooks and firebase interactions using dummy responses from Copy Leaks apis, we shall now replace the dummy responses with actual api calls.

### Tasks

**Step1:** Install the CopyLeaks SDK package

1. Install the CopyLeaks SDK Package - https://www.npmjs.com/package/plagiarism-checker.
2. Install the `uuid` package to generate Ids - https://www.npmjs.com/package/uuid
3. Install the `types/uuid` package - https://www.npmjs.com/package/@types/uuid

<details>
  <summary>Solution</summary>

1. In your terminal run `pnpm i plagiarism-checker`
2. In your terminal run `pnpm i uuid`
3. In your terminal run `pnpm i --save-dev @types/uuid`

</details>
</br>

**Step2:** Download `copyLeaksWrapper.ts` file from [here](content/lib/copy-leaks) and place it into your `lib/copy-leaks/` folder.

**Step3:** Create a Plagiarism Check API

1. Create an Edge function named `plagiarismCheck.ts` which calls our `CopyLeaksWrapper.scan` function the the text to be scanned. More information: https://vercel.com/docs/concepts/functions/edge-functions.
2. Deploy your API

**Important: When CopyLeaks.scan is called, this request returns an HTTP Code of 201. This function does not return the results directly, instead when the results are ready, CopyLeaks sends a response to one of our APIs via webhook. The webhook will only be called on a deployed public website. ie. Having localhost as the webhook domain will not work as localhost will not have a publicly accessible IP.**

<details>
  <summary>Solution</summary>

1. Create a file named `plagiarismCheck.ts` in `pages/api`.
2. Create a handler which takes a `req` parameter.
3. Instantiate the `CopyLeaksWrapper`.
4. Get the text to be scanned from the `req` parameter.
5. Call the `CopyLeaks.scan` method with the text.
6. Return the `scanId`.
7. Push your code to main to deploy your API.

```ts
import { CopyLeaksWrapper } from "@/lib/copy-leaks/copyLeaksWrapper";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

type ScanRequest = {
  text: string;
};

export default async function handler(req: NextRequest) {
  const copyLeaks = new CopyLeaksWrapper();
  const body = (await req.json()) as ScanRequest;
  const scanId = await copyLeaks.scan(body.text);
  return NextResponse.json({ scanId });
}
```

</details>
</br>

**Step4:** Calling the Export Function from the Scan Webhook

Once the `scan` Webhook receives a result we want to immediately call the CopyLeaksWrapper function `getDetailedResults` in order to get more details on the source with the highest number of matched words. This is step 3.3.2.2 in our workflow.

Edit your `scan` webhook to call the `CopyLeaksWrapper.getDetailedResults` function with the `scanId` and `resultId` on the source with the highest number of matched words.

<details>
  <summary>Solution</summary>

1. Instantiate the `CopyLeaksWrapper`.
2. Call `CopyLeaksWrapper.getDetailedResults` with the `scanId` and `resultId`.

```ts
import { CopyLeaksWrapper } from "@/lib/copy-leaks/copyLeaksWrapper";
...
export default async function handler(req: NextRequest) {
  const body = await req.json();
  const scanId = body.scannedDocument.scanId;
  const { resultId, matchedWords } = getHighestSourceResult(body);
  if (matchedWords != 0) {
    const copyLeaks = new CopyLeaksWrapper();
    await copyLeaks.getDetailedResults(scanId, resultId);
  }
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}/scans/${scanId}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ matchedWords: matchedWords }),
      }
    );
  } catch (e) {
    console.error("Error writing to Firebase Database", e);
    throw e;
  }

  return NextResponse.json({ message: "Scan complete" });
}
```

</details>
</br>

**Step5:** Push your code to main to deploy your API. Your code has to be deployed before we can test out Copy Leaks Apis.

---

## 3.7 Hookup API to Frontend

Now that we know the UI works with dummy values, lets use real world values. **Important: From this point on your application must be deployed in order for the plagiarism check to work**

**3.7.1 Calling the Scan API**

1. In `blurb.tsx`, remove the direct calls to the `scan` and the `export` Webhooks.
2. Write a `useEfffect` function call to our `scan` API.

<details>
  <summary>Solution</summary>

1. Remove the direct calls to the `scan` and the `export` Webhooks.
2. Append the `useEfffect` function to watch for when a `blurb` is set and `finishedStreaming` is true. When this is true call the `checkPlagiarism` function.
3. Create a `checkPlagiarism` function which takes the `text` as a parameter.
   1. Set `plagiarismLoading` to be true.
   2. Call our `scan` API with our text. Get the `scanId` from this response.
   3. Set `plagiarismLoading` to be false.

```ts
type ScanResponse = {
  scanId: string;
};
...
  const checkPlagiarism = async (streamedBlurb: string) => {
    setPlagiarismLoading(true);

    // Send blurb to be scanned for plagiarism
    const scanResponse = await fetch("/api/plagiarismCheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: streamedBlurb,
      }),
    });

    const scanId = ((await scanResponse.json()) as ScanResponse).scanId;
    const firebase = new FirebaseWrapper();
    const scanRef = firebase.getScanReference(scanId);
    onValue(scanRef, async (scanRecord: any) => {
      // Only continue if a <scanId> node is present in Firebase
      if (scanRecord.exists()) {
        const scan = scanRecord.val();
        handleScan(streamedBlurb, scan);
      }
    });
    setPlagiarismLoading(false);
  };
```

</details>
</br>

Finally, push your code to deploy your app and test your blurbs with real plagiarism check. **Important: Once we deploy, we are no longer in sandbox mode, the response from CopyLeaks may take up to two minutes so you may see the loading spinner for a long time.**

If a response hasn't come back after two minutes, check https://api.copyleaks.com/dashboard to see if you have enough credits. Remember we are checking 3 blurbs at once so we will use 3 credits every time we generate blurbs. If you run out of credits you will have to create a new Copy Leaks account with a different email address as outlined in step 3.6.1

---

Congratulations you have now completed module 3 and ready to move on to the fourth module. If you have any issues finishing off module 3, you can download the app from [Module3- Final Demo](final-demo/) and move on to the next module.

**Module4** Tweeting your Blurb -> [Get started](/module4/README.md)
