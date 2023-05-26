# Module 2

Welcome to the second module of this workshop. By this part of the workshop, you should already know about the main technologies we are using and have built and deployed your app with a basic home page.
In this module, our primary focus will be on establishing an API endpoint for your application and seamlessly integrating it with OpenAI APIs to generate captivating social blurbs. We will then delve into the process of refining our input parameters for the OpenAI API, ensuring that the generated output aligns more closely with our desired context and requirements.

## Creating an api endpoint in Next.js

A great advantage of using Next.js is that we can handle both the frontend and backend in a single application. In Next.js, you can create APIs using API routes, a built-in feature that allows you to define server-side endpoints within your Next.js application. In order to create a new api route, you can simply add a file under ```pages/api/``` folder and Next.js handles all the routing for you.

Let's now get started to create a new API:

Step 1: Create an API route

* In your Next.js project, navigate to the pages/api directory.
* Create a new file named generateBlurb.ts (This file will represent your API route)
* Define the API logic: Inside the API route file, you can define the logic for your API. You can handle HTTP requests, process data, and return responses.

  ```typescript
  const handler = async (req: Request): Promise<Response> => {
    return new Response("This API is not implemented yet", { status: 400 });
  };

  export default handler;
  ```

* Make API requests: Now, you can make requests to your API from client-side code, server-side code, or any other applications. You can use JavaScript's built-in fetch function or any other HTTP client libraries to make requests to your API endpoint. </br></br>

  In your previous module, you have created a button in your homepage with an empty function click called ```generateBlurb()```. Let's now go and replace that function's implementation with a call to our api endpoint.

  ```typescript
    async function generateBlurb() {
      const response = await fetch("/api/generateBlurb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "Here is an empty body",
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      console.log(response);
    }
  ```

### Change your api to call OpenAI endpoint

Before we get to the development, let's find out what is OpenAI and how should you use it? <br/>
OpenAI is known for developing advanced language models, such as GPT (Generative Pre-trained Transformer), which can generate human-like text based on given prompts or inputs. OpenAI also provides an API (Application Programming Interface) that allows developers to access and utilize the power of these language models in their own applications, products, or services.

For the purpose of this workshop, we have provided you with OpenAI credentials, saving you from the hustle of going through the sign-up process.

#### Change generateBlurb.ts to call OpenAI

We get the prompt from the request body that is passed in from the frontend. In this payload we have to specifiy the api paramters needed by gpt3.5.

After the payload is constructed, we seend it in a POST request to OpenAI, await the result to get back the generated bios, then we send that back to the client as JSON


generate.ts

```
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

Now lets update our frontend to receive the response from the API.

```
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

    const answer = await response.json();
    console.log(answer);

```

Thats it! we've built the first version of our application. However we are only outputting to the console!

Lets create a output now for this to display.















### Change to streaming

Whilst this approach works, there are limitations to a serverless function.

1. If we are building a app that we want to wait for longer responses, this will likely take longer than 10 seconds which can lead to a timeout issue on the vercel free tier.

2. Waiting several seconds before seeing any data is poor UX design. Ideally we want to have a incremental load to do this.

3. Cold start times from the serverless function can effect UX 

#### Edge functions vs Serverless functions

You can think of Edge Functions as serverless functions with a more lightweight runtime. They have a smaller code size limit, smaller memory, and don’t support all Node.js libraries. So you may be thinking—why would I want to use them?

##### Three answers: speed, UX, and longer timeouts

1. Because Edge Functions use a smaller edge runtime and run very close to users on the edge, they’re also fast. They have virtually no cold starts and are significantly faster than serverless functions.

2. They allow for a great user experience, especially when paired with streaming. Streaming a response breaks it down into small chunks and progressively sends them to the client, as opposed to waiting for the entire response before sending it.

3. Edge Functions have a timeout of 30 seconds and even longer when streaming, which far exceeds the timeout limit for serverless functions on Vercel’s Hobby plan. Using these can allow you to get past timeout issues when using AI APIs that take longer to respond. As an added benefit, Edge Functions are also cheaper to run.

##### Edge Functions and Streaming

Now we have a basic udnerstanding of the benefits of edge functions, lets refactor our existing code to take advantage of the streaming utility

The first thing we will do, is change our generate fucntion to run on the ```edge```. We will also enable in our payloadto openAI ```stream: true```/

As the last step, we will inotroduce a helper function ```OpenAIStream``` to allow for incremental loading of the chatGPT response

```
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

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
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
```

Create the below file in ```./utils/OpenAIStream.ts```

```
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
Lets see what we just did:
1 . It sends a post request to OpenAI with the payload like we did before with the serverless version.

2. We then create a stream to contionly parse the data we're recieving from OpenAi, continoisly checking for ```[DONE]```. This will tell us the stream has completed.

------------------
## Connecting frontend to our API [JOE CONTINUES FROM HERE]

We've updated our backend to stream, however our frontend dosnt know how to interpret the stream.

```diff
  async function generateBlurb() {
+   let done = false;
+   let firstPost = false;
+   let streamedText = "";
    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: prompt,
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

You should now have a streaming response!!

### Prompt Engineering




  ### String manipulation to output multiple cards

