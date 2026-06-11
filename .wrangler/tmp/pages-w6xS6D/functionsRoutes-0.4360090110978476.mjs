import { onRequest as __api___path___ts_onRequest } from "/Users/user/Documents/Code2/HTML/paws/functions/api/[[path]].ts"

export const routes = [
    {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  ]