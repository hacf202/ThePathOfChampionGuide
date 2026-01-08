# Getting started with Vercel Web Analytics

This guide will help you get started with using Vercel Web Analytics on your project, showing you how to enable it, add the package to your project, deploy your app to Vercel, and view your data in the dashboard.

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. If you don't have it, you can install it using the following command:

```bash
# Using pnpm
pnpm i vercel

# Using yarn
yarn i vercel

# Using npm
npm i vercel

# Using bun
bun i vercel
```

## Enable Web Analytics in Vercel

On the [Vercel dashboard](/dashboard), select your Project and then click the **Analytics** tab and click **Enable** from the dialog.

> **💡 Note:** Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*`) after your next deployment.

## Add `@vercel/analytics` to your project

For this project (Vite + React), add the `@vercel/analytics` package to your project:

```bash
# Using pnpm
pnpm i @vercel/analytics

# Using yarn
yarn i @vercel/analytics

# Using npm
npm i @vercel/analytics

# Using bun
bun i @vercel/analytics
```

## Add the Analytics Component to Your App

For React applications, import and add the `Analytics` component from `@vercel/analytics/react`:

### Option 1: Using the Analytics Component (Recommended)

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with React, including route support.

Add the following code to your main App component (`src/App.jsx`):

```jsx
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <YourAppContent />
      <Analytics />
    </>
  );
}

export default App;
```

### Option 2: Using the inject Function

For other setups, you can use the `inject` function which should only be called once in your app and must run in the client:

```js
import { inject } from "@vercel/analytics";

inject();
```

> **💡 Note:** There is no route support with the `inject` function.

## Deploy Your App to Vercel

Deploy your app using the following command:

```bash
vercel deploy
```

If you haven't already, we also recommend [connecting your project's Git repository](/docs/git#deploying-a-git-repository), which will enable Vercel to deploy your latest commits to main without terminal commands.

Once your app is deployed, it will start tracking visitors and page views.

> **💡 Note:** If everything is set up properly, you should be able to see a Fetch/XHR request in your browser's Network tab from `/_vercel/insights/view` when you visit any page.

## View Your Data in the Dashboard

Once your app is deployed, and users have visited your site, you can view your data in the dashboard.

To do so, go to your [dashboard](/dashboard), select your project, and click the **Analytics** tab.

After a few days of visitors, you'll be able to start exploring your data by viewing and filtering the panels.

Users on Pro and Enterprise plans can also add custom events to their data to track user interactions such as button clicks, form submissions, or purchases.

Learn more about how Vercel supports [privacy and data compliance standards](/docs/analytics/privacy-policy) with Vercel Web Analytics.

## Next Steps

Now that you have Vercel Web Analytics set up, you can explore the following topics to learn more:

- [Learn how to use the `@vercel/analytics` package](/docs/analytics/package)
- [Learn how to set update custom events](/docs/analytics/custom-events)
- [Learn about filtering data](/docs/analytics/filtering)
- [Read about privacy and compliance](/docs/analytics/privacy-policy)
- [Explore pricing](/docs/analytics/limits-and-pricing)
- [Troubleshooting](/docs/analytics/troubleshooting)

## Current Implementation Status

This project has already integrated Vercel Web Analytics:

- ✅ `@vercel/analytics` package is installed
- ✅ Analytics component is imported in `src/App.jsx`
- ✅ Analytics component is rendered in the App component tree
- ✅ Web Analytics is configured for automatic route tracking

### Implementation Details

The Analytics component has been integrated into the main React app (`src/App.jsx`):

```jsx
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
          <Analytics />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
```

This setup ensures that:
1. Analytics tracking is enabled for all pages in the application
2. Route changes are automatically tracked (thanks to React Router integration)
3. All visitor and page view data is sent to Vercel's Analytics dashboard
4. Privacy-compliant analytics are collected for your users

### Vercel Configuration

The `vercel.json` file in the frontend directory is configured for proper SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all routes are properly handled by the React application, allowing Analytics to track all pages correctly.

## Troubleshooting

### Analytics not showing data

1. Ensure Web Analytics is enabled in your Vercel project dashboard
2. Verify that the `Analytics` component is rendered in your app
3. Check the browser's Network tab for `/_vercel/insights/view` requests
4. Ensure your app has been deployed to Vercel (local development won't show analytics)
5. Wait a few moments after deployment for data to start flowing

### Custom events not working

Make sure you're using the latest version of `@vercel/analytics`:

```bash
pnpm update @vercel/analytics
```

For more troubleshooting information, see the [official troubleshooting guide](/docs/analytics/troubleshooting).
