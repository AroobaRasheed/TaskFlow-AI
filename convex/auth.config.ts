// convex/auth.config.ts
// Convex Auth configuration using password provider

export default {
  providers: [
    {
      // Built-in Convex password authentication
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
