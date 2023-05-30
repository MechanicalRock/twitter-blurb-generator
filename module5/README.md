# Module 5

Welcome to Module 5, this is an optional module that takes you through using the image generation endpoint on OpenAi. OpenAI has recently introduced Dall-E models allowing you to:

* Create images from scratch
* Editing an existing image based on a prompt
* Creating variations of an exiting image

In this module you will be creating an image based on the given prompt and attaching it to your twitter post.

---

## Contents

5.1 [Creating a new api for image generation](#image-generation-api)
</br>
5.2 [Frontend design for displaying the image](#frontend-design-for-displaying-the-image)
</br>
5.3 [Optimizing the prompt](#optimizing-the-prompt)
</br>
5.4 [Allowing users to regenerate the photo](#allowing-users-to-regenerate-the-photo)
</br>

---

## Image generation API

In order to call OpenAI image generation endpoint, we will have to first create a new API in Next.js

1. Create a new API endpoint on NextJs and call it generateImage.ts
2. Update your API code to fetch a new image from OpenAI endpoint. [OpenAI documentation](https://platform.openai.com/docs/guides/images/usage)</br>
  This guide is using OpenAI sdk client which is a better way of using OpenAI apis instead of fetch method. However if you want to continue using the fetch method, this is the openAI endpoint for image generation: https://api.openai.com/v1/images/generations
3. Create a button in your frontend and test your API call console logging the output

By this far in the workshop you should already be efficient in creating new API endpoints, however if you are really stuck, here is the solution:

<details>
  <summary>Solution</summary>

```ts
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload: OpenAIImagePayload = {
    prompt:
      "a photo of a happy corgi puppy sitting and facing forward, studio light, longshot",
    size: "256x256",
    n: 1,
  };
  let image_url = "";
  fetch("https://api.openai.com/v1/images/generations", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      image_url = data.data[0].url;
      console.log(
        "The response of image generation was: ",
        JSON.stringify(image_url)
      );
    });
  return new Response(image_url, { status: 200 });
};

export default handler;
```

</details>
</br>

**Challenge 1:**
Change your OpenAI calls to use the available SDK instead of hitting the API directly

### Frontend design for displaying the image

1. 

---

## Optimizing the prompt

Now let's play with the image generation endpoint to optimize the image and make it the most relevant to the text.

---

### Allowing users to regenerate the photo
