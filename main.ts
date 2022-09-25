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
  getOwnerInfoMap,
  getCounts,
  refresh
} from "https://raw.githubusercontent.com/babyswaplover/landb/0.2.1/mod.ts";
import type { Land } from "https://raw.githubusercontent.com/babyswaplover/landb/0.2.1/mod.ts";

// Listen port of Server
const PORT = 8000;

const app = new Application();

/**
 * formats location like (x,y)
 * @param x 
 * @param y 
 * @returns 
 */
function formatLocation(x:number, y:number):string {
  return `(${x},${y})`;
}

/**
 * formats Size like: NxN
 * @param regionWeight 
 * @returns 
 */
function formatSize(regionWeight:number):string {
  return `${regionWeight}x${regionWeight}`;
}

/**
 * formats type like: Normal/Premium
 * @param level 
 * @returns 
 */
function formatType(level:number):string {
  return level==2 ? 'Premium' : 'Normal';
}

/**
 * renders HTML with template engine ejs
 * @param context oak context
 * @param fileName template file 
 * @param parameters parameters
 */
async function render(context:Context, fileName:string, parameters:Params) {
  try {
    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = await renderFileToString(
      join('views', fileName),
      Object.assign({
        formatLocation,
        formatSize,
        formatType
      }, parameters));
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
  const ownerInfo = getOwnerInfoMap();
  const totalCounts = [...ownerInfo].reduce((totalCounts, entry)=>{
    return entry[1].counts.reduce((_, count, index)=>{
      totalCounts[index] = (totalCounts[index] ?? 0) + count
      return totalCounts;
    }, totalCounts);
  }, <number[]>[]);
  const sizes = totalCounts.reduce((sizes, count, index)=>{
    if (count) {
      sizes.push(index);
    }
    return sizes;
  }, <number[]>[]);

  await render(context, "index.ejs", {
    date: getDate(),
    counts: getCounts(),
    ownerInfo,
    sizes
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

router.get('/address/:address/adjacents', async (context) => {
  const address = context.params.address;
  // Land with adjacents
  interface Adjacent extends Land {
    adjacents: Land[]
  }
  const lands = getLands(address);
  for (const land of lands) {
    const adjacents = getAdjacentLands(land);
    (<Adjacent>land).adjacents = adjacents;
  }
  await render(context, "addressAdjacents.ejs", {
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


export async function start(port:number) {
  await app.listen({ port });
}

// Start listening
if (import.meta.main) {
  console.log(`Listening.  http://localhost:${PORT}/`);
  await start(PORT);
}
