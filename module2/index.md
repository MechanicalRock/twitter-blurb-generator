# Module 2: Connecting to ChatGPT

Welcome to the second module of this workshop. By this part of the workshop, you should already know about the main technologies we are using and have built and deployed your app with a basic home page.

In this module, our primary focus will be on establishing an API endpoint for your application and seamlessly integrating it with OpenAI APIs to generate captivating social blurbs.

We will then delve into the process of refining our input parameters for the OpenAI API, ensuring that the generated output aligns more closely with our desired context and requirements.

If you've had issues so far, clone from [Module1]().

## Contents

2.1 Creating a NextJs API endpoint
<br>
2.2 Connecting our API to OpenAI
<br>
2.3 Displaying our response as a Card
<br>
2.4 Serverless VS Streaming
<br>
2.5 Prompt Engineering
<br>
2.6 Refactoring into Components
<br>
2.7 Challenge: Add in dropdown choices to set the prompt vibe

## 2.1: Creating an api endpoint in Next.js

---

A great advantage of using Next.js is that we can handle both the frontend and backend in a single application. In Next.js, you can create APIs using API routes, a built-in feature that allows you to define server-side endpoints within your Next.js application.

Let's now get started to create a [new API in NextJs](https://nextjs.org/learn/basics/api-routes/creating-api-routes):

### <u>Step 1: Create an API route</u>

<details>
   <summary><span style="color:red"><span style="color:red">Solution</summary>

- In your Next.js project, navigate to the pages/api directory.
- Create a new file named generateBlurb.ts (This file will represent your API route)
- Define the API logic: Inside the API route file, you can define the logic for your API. You can handle HTTP requests, process data, and return responses.

  ```ts
  import { NextApiRequest, NextApiResponse } from "next";

  const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200);
    res.send({
      body: "Success response",
    });
  };

  export default handler;
  ```

  </details>

<br>

### <u>Step2: Linking the frontend to our API</u>

Now, you can make requests to your API from client-side code, server-side code, or any other applications. You can use JavaScript's built-in fetch function or any other HTTP client libraries to make requests to your API endpoint. </br></br>

In your previous module, you have created a button in your homepage with an empty function click called `generateBlurb()`. Let's now go and replace that function's implementation with a call to our api endpoint.

<details>
   <summary><span style="color:red">Solution</summary>

```ts
async function generateBlurb() {
  const response = await fetch("/api/generateBlurb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "This is an empty prompt",
    }),
  });
  const data = await response.json();
  console.log(data);
}
```

</details>

</br>

### <u>Step 3: Connecting OpenAI to our API</u>

Before we get to the development, let's find out what is OpenAI and how should you use it?

OpenAI is known for developing advanced language models, such as GPT (Generative Pre-trained Transformer), which can generate human-like text based on given prompts or inputs. OpenAI also provides an API (Application Programming Interface) that allows developers to access and utilize the power of these language models in their own applications, products, or services.

For the purpose of this workshop, we have provided you with OpenAI credentials, saving you from the hustle of going through the sign-up process.

#### Place the OpenAI key into your environment variables

Next.js provides native support for managing environment variables, offering the following capabilities:

1. You can easily load your environment variables by storing them into a .env.local file
2. You can expose your environment variables to the browser by prefixing them with NEXT*PUBLIC*

In order to access the openAI key in your app, create a new file in the project root folder and name it .env.local.

```text
OPENAI_API_KEY=xyzxyzxyzxyz
```

Now you should be able to access this key in your app by using `process.env.OPENAI_API_KEY`

---

## 2.2: Connecting generateBlurb.ts to call OpenAI

We get the prompt from the request body that is passed in from the frontend. In this payload we have to specify the api parameters needed by gpt3.5.

After the payload is constructed, we send it in a POST request to OpenAI, await the result to get back the generated bios, then we send that back to the client as JSON

Resources:

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

<details>
   <summary><span style="color:red">Solution</summary>

```ts
export default async function handler(req, res) {
  const { prompt } = req.body;

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    n: 1,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  res.status(200).json(json);
}
```

</details>

---

<br>

Now lets update our frontend to receive the response from the API. For now, we will just log the output to the console.

<details>
   <summary><span style="color:red">Solution</summary>

```diff

- async function generateBlurb() {
-  const response = await fetch("/api/generateBlurb", {
-  method: "POST",
-  headers: {
-     "Content-Type": "application/json",
-   },
-   body: JSON.stringify({
-     prompt: "This is an empty prompt",
-   }),
-  });
-  const data = await response.json();
-  console.log(data);
-}

+  const generateBlurb = useCallback(async () => {
+   const response = await fetch("/api/generateBlurb", {
+     method: "POST",
+     headers: {
+       "Content-Type": "application/json",
+     },
+     body: JSON.stringify({
+       prompt: blurbRef.current,
+     }),
+   });

+  if (!response.ok) {
+    throw new Error(response.statusText);
+   }

+   const answer = await response.json();
+   console.log(answer);
        }
+ , [blurbRef.current]);

  const answer = await response.json();
  console.log(answer);
}, [blurbRef.current]);
```

</details>

<br>

Thats it! we've built the first version of our application. However we are only outputting to the console!

Lets create a output now for this to display.

---

<br>

## 2.3 Creating a Card to display the OpenAI Output

Now we've got a actual response from openAI, lets display it in our app.

You will need the following things

- Implement a MUI card to display the response
- Output OpenAI response into a state [UseState]()

<details>
   <summary><span style="color:red">Solution</summary>

Add the following to your code.

```diff
- import { useRef } from "react";
+ import { useRef, useState } from "react";
export default function Home() {
  const blurbRef = useRef("");
+  const [generatedBlurb, setGeneratedBlurb] = useState("");

...
+ {generatedBlurb && (
+    <Card>
+      <CardContent>{generatedBlurb}</CardContent>
+    </Card>
+ )}

</Stack>
```

</details>

Next step is to update our state with the response from OpenAi

Resources: [React Use State](https://www.w3schools.com/react/react_usestate.asp)

<details>
   <summary><span style="color:red">Solution</summary>

Add the following to your code.

```diff
...

    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: blurbRef.current,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const answer = await response.text();
    console.log(answer);

+   setGeneratedBlurb(answer);

....
```

</details>

<br>

Congrats, you should now be seeing the response from OpenAI using our prompt
<br>

---

## 2.4 Streaming Vs Serverless

Whilst this approach works, there are limitations to a serverless function.

1. If we are building a app that we want to wait for longer responses, this will likely take longer than 10 seconds which can lead to a timeout issue on the vercel free tier.

2. Waiting several seconds before seeing any data is poor UX design. Ideally we want to have a incremental load to do this.

3. Cold start times from the serverless function can effect UX

#### Edge functions vs Serverless functions

You can think of [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions) as serverless functions with a more lightweight runtime. They have a smaller code size limit, smaller memory, and don’t support all Node.js libraries. So you may be thinking—why would I want to use them?

##### Three answers: speed, UX, and longer timeouts

1. Because Edge Functions use a smaller edge runtime and run very close to users on the edge, they’re also fast. They have virtually no cold starts and are significantly faster than serverless functions.

2. They allow for a great user experience, especially when paired with streaming. Streaming a response breaks it down into small chunks and progressively sends them to the client, as opposed to waiting for the entire response before sending it.

3. Edge Functions have a timeout of 30 seconds and even longer when streaming, which far exceeds the timeout limit for serverless functions on Vercel’s Hobby plan. Using these can allow you to get past timeout issues when using AI APIs that take longer to respond. As an added benefit, Edge Functions are also cheaper to run.

##### Edge Functions and Streaming

Now we have a basic understanding of the benefits of edge functions, lets refactor our existing code to take advantage of the streaming utility

<details>
   <summary><span style="color:cyan">pages/index.html</summary>

```diff
+ import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

+ export const config = {
+   runtime: "edge",
+ };

const handler = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
+   stream: true,
    n: 1,
  };

-    const response = await fetch("https://api.openai.com/v1/chat/completions", {
-    headers: {
-      "Content-Type": "application/json",
-      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
-    },
-    method: "POST",
-    body: JSON.stringify(payload),
-  });

-  const json = await response.json();
-  res.status(200).json(json);

+  const stream = await OpenAIStream(payload);
+  return new Response(stream);
};

export default handler;
```

</details>
<br>

Lets have a look at the changes we've made above.

- We've updated our config, so our API will run as a edge function.
- We will also enable in our [payload](https://platform.openai.com/docs/api-reference/completions) `stream:true` . This tells OpenAI to stream the response back, rather than waitng for the response to fully be completed.
- In addtion, we have created a helper function called `OpenAIStream` to allow for incremental loading of the chatGPT response.

Next step is to actually create our helper function:

Create the below file and copy the contents into `./utils/OpenAIStream.ts`

You will also need to install an new dependency `pnpm i eventsource-parser`

<details>
   <summary><span style="color:cyan">/utils/OpenAIStream.ts</summary>

```typescript
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
```

</details>

<br>

Lets see what we just did:

1. It sends a post request to OpenAI with the payload like we did before with the serverless version.
2. We then create a stream to contionly parse the data we're recieving from OpenAi, continoisly checking for `[DONE]`. This will tell us the stream has completed.

---

### Connecting frontend to our API

We've updated our backend to stream, however our frontend dosnt know how to interpret the stream.

Try and do this yourself!

Heres some hints to get you started.

- https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader

<details>
   <summary><span style="color:red">Solution</summary>
  
  ```pages/index/ts```

```diff
  async function generateBlurb() {
+   let done = false;
    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      prompt: prompt,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
+    const data = response.body;
+    if (!data) {
+      return;
+    }
+    const reader = data.getReader();
+    const decoder = new TextDecoder();



+    while (!done) {
+      const { value, done: doneReading } = await reader.read();
+      done = doneReading;
+      const chunkValue = decoder.decode(value);
+      setGeneratedBlurb((prev) => prev + chunkValue);
    }
  }
```

</details>
<br>
You should now have a streaming response!!

<br>

---

<br>

## 2.4 Prompt Engineering

So we have linked our textboxt to input, OpenAI and are displaying the response in a single card.

Lets introuduce you to the concept of prompt engineering and how we will use that to generate our twitter responses, and generate 3 responses using a single call.

Prompt engineering refers to the process of crafting prompts in a way that elicits the best, most accurate, or most insightful response from a language model like GPT-3.5. It involves understanding how the model interprets input and designing prompts that will direct the model towards producing the desired output.

It's similar to how a question can be strategically asked to guide someone towards a particular response. For example, asking "What are the benefits of exercise?" will elicit a very different response than asking "What are the dangers of exercise?"

When it comes to AI models, prompt engineering can involve many strategies, including:

- Making the context clear: AI models often rely heavily on the prompt to understand what's being asked. Providing context helps the AI give a better response.

- Specifying the format of the desired response: If the model knows how the response should be structured, it is more likely to provide what you want.

- Providing examples: Some prompts work better if they include an example of what's being asked.

Prompt engineering can be quite complex because language models don't actually understand language in the way humans do. They're trained on massive amounts of text data and learn to predict the next piece of text based on the input they're given. So, you're essentially trying to understand the model's 'thinking' and craft prompts that will guide it towards the answers you want.

#### Challenge: Create a prompt that feeds into generate API, that will generate 3 clearly labelled twitter bios, using the input we have supplied from the textbox.

<br>

<details>
   <summary><span style="color:red">Solution</summary>

```diff

...
  const [generatedBlurb, setGeneratedBlurb] = useState("");

+  const prompt = `Generate 3 twitter posts with hashtags and clearly labeled "1." , "2." and "3.".
+      Make sure each generated post is less than 280 characters, has short sentences that are found in Twitter posts, write it for a Student Audience, and base them on this context: ${blurbRef.current}`;

  async function generateBlurb() {
    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
-       prompt: blurbRef.current
+       prompt: prompt,
      }),
    });

    ...


```

Lets explain what we just did:

- Created a new value `prompt` that is taking a hardcoded text, and subsititing our textbox, bound to `blurbRef` into the text body.

Remeber OpenAI, needs to return a response that we can parse, hence we have clearly prompted it to return each post clearly labelled, we then use this in the next section to seperate each blurb into its own output.

Feel free to manipulate and add in your own changes.

</details>

<br>

---

## 2.5 String manipulation to output multiple cards

So currently our output is generating 3 posts, however they all displaying into one card! To fix this we can use have to seperate each post into their own card.

Have a go at doing this yourself, below are some hints to get you started.

Resources:

- [String Splitting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)

<details>
   <summary><span style="color:red">Solution</summary>

```diff
      {generatedBlurb && (
-    <Card>
-      <CardContent>{generatedBlurb}</CardContent>
-    </Card>
+       <>
+         {generatedBlurb
+          .substring(generatedBlurb.indexOf("1.") + 3)
+          .split(/2\.|3\./)
+          .map((generatedPost) => {
+            return (
+             <Card>
+               <CardContent>{generatedPost}</CardContent>
+             </Card>
+             );
+           })}
+       </>
+     )}

```

Lets explain what we just did.

1. generatedBlurb.substring(generatedBlurb.indexOf("1.") + 3): This finds "1." in the string generatedBlurb and trims off the part before and including "1.".

2. .split(/2\.|3\./): This divides the string into parts at "2." and "3." and makes an array (list) of these parts.

3. .map((generatedPost) => {...}): This creates a new list. Each item in the old list is turned into a Card component.

4. <Card>...<CardContent>{generatedPost}</CardContent>...</Card>: For each part of the string, it makes a Card with the text inside it.

In short, the code splits a text string into parts at "1.", "2.", and "3.", and displays each part in a separate Card component.

</details>

<br>

**Challenge:** you will note that at the beginning of the stream, there is a text been streamed in that is not part of the final output?

Why is this occuring? Have a go and trying to fix it.

<details>
   <summary><span style="color:red">Solution</summary>

```diff
    let done = false
+   let firstPost = false;
+   let streamedText = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
-     setGeneratedBlurb((prev) => prev + chunkValue);
+     streamedText += chunkValue;
+     if (firstPost) {
+       setGeneratedBlurb(streamedText);
+     } else {
+       firstPost = streamedText.includes("1.");
      }
    }

```

</details>

---

<br>

## 2.6 Refactoring into Components

Currently, our `index.tsx` is quite messy. Let's try and refactor the `Card` Component into another file.

**Tasks**

**2.6.1 Refactor index.tsx**

1. Move the card component which holds the blurb into a separate component file called `Blurb.tsx`

<details>
   <summary>Solution</summary>

Your `Blurb` component should now look like this:

```ts
import { Card, CardContent } from "@mui/material";

interface Props {
  generatingBlurb: string;
}

export function Blurb({ generatingBlurb }: Props) {
  return (
    <Card>
      <CardContent>{generatingBlurb}</CardContent>
    </Card>
  );
}
```

`index.tsx` should now look like this:

```ts
...
      <Button onClick={generateBlurb}>Generate Blurb</Button>
      {generatingPosts && (
        <>
          {generatingPosts
            .substring(generatingPosts.indexOf("1.") + 3)
            .split(/2\.|3\./)
            .map((generatingPost, index) => {
              return (
                <Blurb key={index} generatingBlurb={generatingPost}></Blurb>
              );
            })}
        </>
      )}
      ...
```

   </details>

## 2.7 Challenge: Add in dropdown choices dynamically change the audience type

Currently, the student audience is hardcoded into our prompt. Can you create a drop down to dynamically change the audience type?

Resources:

- [MUI Dropdown Component](https://mui.com/material-ui/react-select/)
- [React Use Ref](https://www.w3schools.com/react/react_useref.asp)

<details>
   <summary><span style="color:red">Solution</summary>

```diff
...

-   const prompt = `Generate 3 twitter posts with hashtags and clearly labeled "1." , "2." and "3.".
-   Make sure each generated post is less than 280 characters, has short sentences that are found in Twitter posts, write it for a student Audience, and base them on this context: ${blurbRef.current}`;
+   const prompt = `Generate 3 twitter posts with hashtags and clearly labeled "1." , "2." and "3.".
+   Make sure each generated post is less than 280 characters, has short sentences that are found in Twitter posts, write it for a ${audienceRef.current} Audience, and base them on this context: ${blurbRef.current}`;
...

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamedText += chunkValue;
      if (firstPost) {
        setGeneratedBlurb(streamedText);
      } else {
        firstPost = streamedText.includes("1.");
      }
    }
-  }, [blurbRef.current, audienceRef.current]);
+  }, [blurbRef.current, audienceRef.current]);

...

      ></TextField>

+      <FormControl fullWidth>
+       <InputLabel id="Audience">Audience</InputLabel>
+       <Select
+          labelId="Audience"
+          id="Audience"
+          label="Audience"
+          onChange={(event) => {
+            audienceRef.current = event.target.value;
+          }}
+          value={audienceRef.current}
+        >
+          <MenuItem value="Student">Student</MenuItem>
+          <MenuItem value="Profesional">Profesional</MenuItem>
+          <MenuItem value="Monkey">Monkey</MenuItem>
+        </Select>
+      </FormControl>

      <Button onClick={generateBlurb}>Generate Blurb</Button>

      ...

```

</details>
