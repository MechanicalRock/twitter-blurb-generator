# Module 1

In this module you will be learning about some of the web development technologies that we are most excited about. You will go through the basic concepts, understanding the technologies we are using in this workshop and why, we will then take you through how to get started in building your first hello world application and how to deploy and get it running.

Let's begin with some of the basic concepts about tools and technologies we are using in this workshop:

## basic concepts

### Client Side Rendering vs Server Side Rendering

Recently Server side rendering has been getting more and more attraction among the web development community and that is thanks to React and its built-in server-side hydration features. Before we begin, let's just first step back to understand the difference. The main difference between the two is where the web content is rendered. On CSR approach the page content is rendered on the client browser using JavaScript for dynamic rendering vs with the SSR approach the content is fully rendered on the server and sent to the client.

Why should you use Server Side Rendering?

1. Server-side rendering delivers fully rendered HTML to the client, which leads to faster initial page loads compared to client-side rendering.
2. Search engines typically have difficulty parsing and indexing client-rendered JavaScript content. With server-side rendering, the initial HTML is sent to the client, making it easier for search engine crawlers to read and index the content. This can positively impact the visibility and ranking of your website in search engine results.
3. SSR enables code sharing between the client and the server, reducing duplication and improving  efficiency. It also simplifies the development by having to maintain one codebase for both frontend and backend.
4. Server-side rendering can provide a better perceived performance. Users see fully rendered content immediately upon loading the page, reducing the time it takes to see meaningful content and interact with the application.
5. Server-side rendering can be beneficial for users on low-end devices or with limited network connectivity. By offloading the rendering process to the server, the client device requires less processing power and memory, resulting in improved performance and reduced battery consumption.

### What is Next JS?

Next.js is a popular React framework that provides built-in server-side rendering (SSR) capabilities. It combines the power of server-side rendering, static site generation, and client-side rendering, offering a versatile framework for building performant and scalable web applications. Its simplicity, performance optimizations, and robust feature set make it a compelling choice for developers and organizations seeking to build modern web applications.

### What is pnpm and why are we using it?

Pnpm is a new nodejs package manager like npm and yarn. It stands out as an excellent package manager known for its remarkable speed, surpassing both yarn and npm in terms of performance. When using pnpm, you can truly experience its swift package installation process. Additionally, an advantageous aspect of pnpm is its compatibility with different versions of Node.js, resembling the convenience of nvm for managing nodejs versions. Following steps will take you through how to install Next.js with pnpm:

## Creating hello world app in Next.js

```bash
npm install -g pnpm
```

Create an app

``` bash
pnpx create-next-app@latest --use-pnpm
```
The --use-pnpm flag ensures that pnpm is used as the package manager for the project.

Choose a template (optional): After running the command above, you'll be prompted to choose a template for your Next.js app. You can select from options like a default template, a TypeScript template, or an example template. Choose the one that suits your project requirements, or simply press Enter to select the default template.

Navigate to the app directory: Once the project is created, navigate to the app's directory using the following command:

```bash
cd your-app-name
```

Start the development server: Now, you can start the development server and run your Next.js app. Use the following command:

```bash
pnpm dev
```

This command will start the development server and provide you with a local URL (e.g., http://localhost:3000) where you can view your app.

That's it! You've successfully created a new Next.js app using pnpm as the package manager. You can start building your app by modifying the files in the pages directory and exploring the Next.js documentation for more information on how to work with Next.js features and components.

### Setting up your git repository

Next step is to push your application into a git repository. This is required for setting up automatic deployment from every change you push into your main branch (Continuous Deployment).

**Step1:**
Go to your github account and create a new repository. Take a note of your repository clone url

> **Note**
> Make sure to create the new repository under your personal profile not your work organization to avoid permission problems later.

**Step 2:**
Go back to the terminal in your visual studio code. Make sure you currently are in the app folder that you just created.

Execute below commands:

```bash
git init
git branch -M main
git remote add origin '[your repository clone url]'
git push -u origin main
```

### Deploying your webapp using Vercel

Now that we have our hello world application we would like to learn how to deploy this app into production. To do that, we are using Vercel for deploying server infrastructure.

#### What is Vercel?

Vercel is a cloud platform that specializes in static site hosting and serverless functions deployment. It provides an intuitive and seamless way to deploy web applications, APIs, and serverless functions, with a focus on speed, scalability, and ease of use. Vercel is known for its developer-friendly experience, making it a popular choice for static site hosting, Jamstack applications, and serverless functions deployment. It offers an intuitive user interface, seamless Git integration, automatic scaling, built-in analytics and monitoring, domain and SSL management and a range of powerful features that simplify the deployment and management of modern web applications.

If you wanted to deploy this application using AWS services, you would have had to learn about infrastructure such as CloudFront, API Gateway, Lambda, Route 53, SSL management, S3 buckets and tools to deploy and manage your infrastructure such as CDK. Vercel abstracts all of those complexities away allowing you to focus on application development rather than managing infrastructure. This brings an incredible speed when you want to get started with building your product idea as well as it eliminating all the costs of maintaining your infrastructure going forward.

## Deployment

### Setting Up Vercel

1. Go to https://vercel.com/
2. Click on the `Sign Up` button
3. Select `Hobby`. Enter your name. Click Continue
4. Click `Continue with GitHub`
5. Authorize Vercel to connect to your GitHub account <br/>
  Make sure to configure the permissions correctly<br/><br/>
  <img src="content/github-authorization.png" alt="github authorization" width="400"/><br/><br/>
6. Click `Import` next to your Git repository
7. Click on the `Build and Output Settings` accordion.
8. Under `Build Command`, enable the override toggle and enter `pnpm build`
9. Under `Install Command`, enable the override toggle and enter `pnpm install`<br/><br/>
  <img src="content/vercel-settings.png" alt="vercel-settings" width="400"/><br/><br/>
11. Click `Deploy`
12. Once the application has been deployed, click on the image below `Continue to Dashboard` to view your deployed application<br/>
  <img src="content/deployed-app.png" alt="deployed-app" width="400"/>
