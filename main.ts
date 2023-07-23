/**
 * Simple Land Analyzer Web Server for Baby Wonderland
 *  
 * Copyright 2022 babyswaplover
 */
// deno run --allow-net=0.0.0.0,ld-api.babyswap.io --allow-read=.,views --allow-write=. src/server.ts

import {
  // oak
  Application, Router,
  // landb
  getDate,
  refresh
} from "./deps.ts";

// Handlers
import { Index } from "./handlers/index.tsx";
import { Address } from "./handlers/address.tsx";
import { Adjacents } from "./handlers/adjacents.tsx";
import { AddressAdjacents } from "./handlers/addressAdjacents.tsx";
import { AddressNeighbors } from "./handlers/addressNeighbors.tsx";
import { FindMerge } from "./handlers/findmerge.tsx";

// Listen port of Server
const PORT = 8000;

const app = new Application();

// Fetch land and Update database automatically when it takes 30 min since last fetched. 
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 mins.
app.use(async (context, next)=>{
  const lastFetched = getDate();
  if (lastFetched && Date.now() >= Date.parse(lastFetched) + UPDATE_INTERVAL) {
    try {
      await refresh();
    } catch (e) {
      console.warn(e);
    }
  }
  await next();
});

// BASIC Auth
let authMap = new Map<string,string>();
if ((await Deno.permissions.query({name:"env", variable:"AUTH_USERS"})).state == "granted") {
  (Deno.env.get("AUTH_USERS") || "").split(',').forEach((line)=>{
    // user1/pass1,user2/pass2
    const [key, value] = line.split('/');
    if (key) {
      authMap.set(key, value);
    }
  });
}
const publicPaths = ['/', '/favicon.ico'];
app.use((context, next)=>{
  if (!publicPaths.includes(context.request.url.pathname) && authMap.size > 0) {
    const authorization = context.request.headers.get("Authorization");
    if (authorization) {
      try {
        const [user, password] = atob(authorization.replace(/^Basic +/, "")).split(':');
        if (authMap.get(user) == password) {
          next();
          return;
        }
      } catch (e) {
        console.log(e);
      }
    }

    // BASIC Auth required
    context.response.headers.set('WWW-Authenticate', 'Basic realm="Baby Wonderland Analyzer"');
    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.status = 401;
    context.response.body = '<html><body><h1>Unauthorized</h1></body></html>';
    return;
  } else {
    next();
  }
});


// Routing
const router = new Router();
for (const handler of [
  Index,
  Address,
  Adjacents,
  AddressAdjacents,
  AddressNeighbors,
  FindMerge
]) {
  switch (handler.method) {
    case "GET":
      router.get(handler.path, handler.handle);
      break;
    case "POST":
      router.post(handler.path, handler.handle);
      break;
  }
}

app.use(router.routes());
app.use(router.allowedMethods());


export async function start(port:number) {
  await app.listen({ port });
}

// Start listening
if (import.meta.main) {
  console.log(`Listening.  http://localhost:${PORT}/`);
  await start(PORT);
}
