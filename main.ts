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

// Listen port of Server
const PORT = 8000;

const app = new Application();

// Fetch land and Update database automatically when it takes 30 min since last fetched. 
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 mins.
app.use(async (context, next)=>{
  const lastFetched = getDate();
  if (lastFetched && Date.now() >= Date.parse(lastFetched) + UPDATE_INTERVAL) {
    await refresh();
  }
  await next();
});


// Routing
const router = new Router();
for (const handler of [
  Index,
  Address,
  Adjacents,
  AddressAdjacents,
  AddressNeighbors
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
