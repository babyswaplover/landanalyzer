/**
 * Simple Land Analyzer Web Server for Baby Wonderland
 *  
 * Copyright 2022 babyswaplover
 */
// deno run --allow-net=0.0.0.0,ld-api.babyswap.io --allow-read=.,views --allow-write=. src/server.ts

import { Application, Router, Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { renderFileToString } from 'https://deno.land/x/dejs@0.10.3/mod.ts';
import type { Params } from 'https://deno.land/x/dejs@0.10.3/mod.ts';
import { join } from "https://deno.land/std@0.157.0/path/mod.ts";

import {
  getDate,
  getLands,
  getAdjacentLands,
  getLandByTokenId,
  getLandByLocation,
  getCounts,
  refresh
} from "https://raw.githubusercontent.com/babyswaplover/landb/0.2.0/mod.ts";

// Listen port of Server
const port = 3000;

const app = new Application();

/**
 * renders HTML with template engine ejs
 * @param context oak context
 * @param fileName template file 
 * @param parameters parameters
 */
async function render(context:Context, fileName:string, parameters:Params) {
  try {
    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = await renderFileToString(join('views', fileName), parameters || {});
  } catch(e) {
    console.error(e.message);
  }
}

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

router.get('/', async (context) => {
  await render(context, "index.ejs", {
    date: getDate(),
    counts: getCounts()
  });
});

router.get('/address/:address', async (context) => {
  const address = context.params.address;
  const lands = getLands(address);
  await render(context, "address.ejs", {
    date: getDate(),
    address,
    counts: getCounts(address),
    lands
  });
});

router.get('/adjacents/:tokenId', async (context) => {
  let land;
  const values = context.params.tokenId.split(',');
  if (values.length == 1) {
    // tokenId
    const tokenId = Number(context.params.tokenId);
    land = getLandByTokenId(tokenId);
  } else if (values.length == 2) {
    // location: x,y
    const x = Number(values[0]);
    const y = Number(values[1]);
    land = getLandByLocation(x, y);
  }
  if (land) { 
    const adjacents = getAdjacentLands(land);
    await render(context, "adjacent.ejs", {
      date: getDate(),
      land,
      adjacents
    });
  }
});

app.use(router.routes());
app.use(router.allowedMethods());


// Start listening
console.log(`Listening.  http://localhost:${port}/`);
await app.listen({ port });
