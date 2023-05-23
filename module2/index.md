# Module 2

# Context 


## What is OpenAi, and how do I use it


## What is NextJS
A great advangate of using Next.js is being able to handle both the frontend and backend in a single app. We can then spinup the apiroute generate, by creating a file called genreate.ts in our apu folder.

Lets see what this is doing.

We are taking a prompt from the request body, passed in fdrom, the frontend. We then construct a payload to OpenAI. In this payload we soecufut the exact model and how many token we want returtned. In this case we are limiting this because twitter posts have a max chacarter constraint.

After the payload is constructed, we send it in a POST request to OpenAI, await the result to get back the generated bios, then send them back to the client as JSON.


### What are edge functions?
# Limitations of the Serverless functions approach
While using a serverless function works, there are some limitations that make using a edge function a much better expeience

- Cold start times
- Waiting severel seconds for a the full response isnt a good UX
- Serverless timeout issues (10 seconds free tier)

There is a better way.... EDGE FUNCTIONS!!!

Edge functions can be thought of as serverless functins with a lightweight runtume. They have their own limitations, smaller code size limit, smaller memory and dont support all node.js librairies. So why use them??

3 Reasons
- speed
- UX
- longer timeouts

What is streaming
What is a [vercel edge function](https://vercel.com/features/edge-functions)


### Lets get started with the frontend!

Opening up our terminal lets create a new nextJS app

```pnpm create next-app latency-workshop-app --template typescript```

and create with the following options

Now lets check everything is working, run  ```cd latency-workshop-app && pnpm run dev``` and check that the nextJs template is running.
![](./www/pnpm_create_next.png)


![](./www/vercel_splash.png)


Now we can get started on our app!

Lets build out the components we are going to need first. We are going to work from the top down of the page


1. run ```pnpm install @mui/material @emotion/react @emotion/styled```
2. Goto pages/index.ts and replace all with the following
```
import { Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Typography variant="h1">
      Generate your next Twitter post with ChatGPT
    </Typography>
  );
}
```

Obviously this dosnt look too great, so lets add in some simple tailwind to make it look a bit nicer. Feel free to play around with it to get to look as you would like.

```
...
    <Typography
      variant="h1"
      className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
    >
...


This still isnt looking quite write. So lets wrap this in a Stack to get it centred as we would like. 

```
    <Stack
      component="main"
      direction="column"
      maxWidth="50em"
      mx="auto"
      alignItems="center"
      justifyContent="center"
      py="1em"
      spacing="1em"
    >
      <Typography
        variant="h1"
        className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
      >
        Generate your next Twitter post with ChatGPT
      </Typography>
    </Stack>
```
Let’s quickly go over what we are doing here.


Should look like the below

![](./www/image_1.png)

3. Lets add in our intial prompt, first lets create a new folder ```components/fields/PostTextArea.ts```. 

We're gonna set it up as below:

INSERT LE IMAGE

Lets get started by creating this file 

```
import { Box, TextField, Typography } from "@mui/material";
import { MutableRefObject } from "react";

interface Props {
  bioRef: MutableRefObject<string>;
}

export function PostTextArea({ bioRef }: Props) {
  return (
    <Box>
      <Typography variant="body1">
        What content do you want your post to be about?
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={4}
        sx={{ "& textarea": { boxShadow: "none !important" } }}
        placeholder="e.g. I'm learning about NextJs and OpenAI GPT-3 api at the Latency Conference."
        onChange={(e) => {
          bioRef.current = e.target.value;
        }}
      />
    </Box>
  );
}
```


Let’s quickly go over what we are doing here.

- We are creating a new textfield using the MUI library.
- Applying specific styling to remove box shadow
- Placing placeholder htext
- Pass in the prop {{bioRef}}


Next Step is to create our ChatGPTForm. This is where we will populate our textboxt and the rest of our input components.

Create ```components/forms/ChatGptForm.ts```

```

import { Stack } from "@mui/material";
import { useRef } from "react";
import { PostTextArea } from "../fields/PostTextArea";

interface Props {
  blurbsGenerated: boolean;
  setBlurbsGenerated: (blurbsGenerated: boolean) => void;
}
export function ChatGPTForm({ blurbsGenerated, setBlurbsGenerated }: Props) {
  const bioRef = useRef("");
  return (
    <Stack direction="column" spacing="1em" width="100%">
      <PostTextArea bioRef={bioRef} />
    </Stack>
  );
}
```

Let’s quickly go over what we are doing here.

- Importing our PostTextArea component that we just created
- Placing our component in a stack, and passing in the bioref prop


Now lets go to our index file, and make the following changes.


```
...
<ChatGPTForm
  blurbsGenerated={blurbsGenerated}
  setBlurbsGenerated={setBlurbsGenerated}
/>
...
```

Challenge: Can you set the width of the new component?

### Adding a Dropdown Component.

What are we going to be doing:
- Creating a Generic Dropdown Component
- Creating a Vibe Component
- Then you'll go off and create your own component.

#### Generic Dropdown component

Create ```components/fields/DropDown.tsx```, and throw this code in their

```
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";

interface Props<T> {
  value: T;
  label: string;
  options: string[];
  setState: (value: T) => void;
}

export default function DropDown<T>({ value, label, options, setState }: Props<T>) {
  return (
    <Box>
      <Typography variant="body1">{label}</Typography>
      <FormControl fullWidth hiddenLabel>
        <Select
          notched={false}
          value={value}
          onChange={(e) => setState(e.target.value as T)}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
```

Let’s quickly go over what we are doing here:

- This is a TypeScript React component that renders a dropdown menu with a label and a list of options.

- It takes in four props: value, label, options, and setState.

- It uses Material-UI components for its UI.

- The value prop is the currently selected option in the dropdown.

- The label prop is the text that appears above the dropdown.

- The options prop is an array of strings that represent the available options in the dropdown.

- The setState prop is a function that updates the state of the parent component when a new option is selected.

- The component renders a Box component that contains a Typography component with the label prop as its text.

- Below that is a FormControl component that wraps a Select component.

- The Select component has the value prop set to the current value prop and an onChange event handler that calls the setState function with the new selected value.

- The options prop is mapped over to create a list of MenuItem components, each with a unique key prop and a value prop set to the corresponding option string.



Now, lets create a Vive Components ```latencyworkshop/components/fields/VibeDropDown.tsx```

Feel free to change up the names of the vibes, and add your own.

```
import DropDown from "./DropDown";

export type Vibe = "Professional" | "Casual" | "Funny";
export const vibes: Vibe[] = ["Professional", "Casual", "Funny"];

interface Props {
  vibe: Vibe;
  setVibe: (vibe: Vibe) => void;
}

export function VibeDropDown({ vibe, setVibe }: Props) {
  return (
    <DropDown
      value={vibe}
      setState={setVibe}
      label="Select your vibe"
      options={vibes}
    />
  );
}

```
Lets explain what we are doing here:
- Create a typescript type for our vibe
- Create a list of vibes of type Vibe
- Create a Props interface that takes in a vibe and setVibe function
- Create a VibeDropDown component that takes in the vibe and setVibe props

Great, lets add that into our ChatGPTForm component

```
// import "react-circular-progressbar/dist/styles.css";

import { Stack } from "@mui/material";
import { useRef, useState } from "react";

import { PostTextArea } from "../fields/PostTextArea";
import { Vibe, VibeDropDown } from "../fields/VibeDropDown";

interface Props {
  blurbsGenerated: boolean;
  setBlurbsGenerated: (blurbsGenerated: boolean) => void;
}
export function ChatGPTForm({ blurbsGenerated, setBlurbsGenerated }: Props) {
  const bioRef = useRef("");
  const [vibe, setVibe] = useState<Vibe>("Professional");

  return (
    <Stack direction="column" spacing="1em" width="100%">
      <Stack
        spacing="1em"
        width="100%"
        maxWidth="48em"
        mx="auto"
        alignItems="center"
      >
        <PostTextArea bioRef={bioRef} />
        <VibeDropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
      </Stack>
    </Stack>
  );
}
```

### Add your own dropdown component!

front end confuses me

## Backend 