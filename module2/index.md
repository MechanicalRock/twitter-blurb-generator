# Module 2


### Build the frontend steps

Build out components




Create Generate.tsx

What is streaming
What is a [vercel edge function](https://vercel.com/features/edge-functions)

First we'll be building a gpt3.5 powered app using OPENAI, nextjs and Vercel Edge functions.

First with serverless functions, then we will rebuild it with Edge Fucntions and streaming to demonstate the speed and UX improbvements

By the end of this module you should be able to build your own GPT3.5 apps!

## The frontend 

Our nextJs app will consists of the following components

- A text box for users to prompt a specfic context for their post
- multiple dropdowns where you can select the tone and audience of your post
- a submit button for generating the post. This will call the openAI api endpoint and return 3 posts

```
Insert Prompt Here Joe
```

Now lets good at our generated.tsx for a serverless function

```
Go figure this out
```



### The Backend

A great advangate of using Next.js is being able to handle both the frontend and backend in a single app. We can then spinup the apiroute generate, by creating a file called genreate.ts in our apu folder.

Lets see what this is doing.

We are taking a prompt from the request body, passed in fdrom, the frontend. We then construct a payload to OpenAI. In this payload we soecufut the exact model and how many token we want returtned. In this case we are limiting this because twitter posts have a max chacarter constraint.

After the payload is constructed, we send it in a POST request to OpenAI, await the result to get back the generated bios, then send them back to the client as JSON.


# Limitations of the Serverless functions approach
While using a serverless function works, there are some limitations that make using a edge function a much better expeience

- Cold start times
- Waiting severel seconds for a the full response isnt a good UX
- Serverless timeout issues (10 seconds free tier)

There is a better way EDGE FUNCTIONS!!!

Edge functions can be thought of as serverless functins with a lightweight runtume. They have their own limitations, smaller code size limit, smaller memory and dont support all node.js librairies. So why use them??

3 Reasons
- speed
- UX
- longer timeouts

## Edge functions with streaming

