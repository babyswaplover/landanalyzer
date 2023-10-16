# Analysis tool for Baby Wonderland

This is a simple land data analysis tool.

This is an example of [landb](https://github.com/babyswaplover/landb) library.  You can customize this by adding routes and views to analyze land data of [Baby Wonderland](https://land.babyswap.finance/land).

## Sample

This sample is deployed here:  
[https://landanalyzer.deno.dev/](https://landanalyzer.deno.dev/)

※Server errors might occur due to the quota of Deno Deploy for free.

### Page samples

| Request path                   | Description                               |
|:-------------------------------|:------------------------------------------|
| /                              |Summary of Lands                           |
| /address/`<address>`           |Lands owned by address                     |
| /address/`<address>`/adjacents |Lands owned by address and their adjacents |
| /address/`<address>`/neighbors |Adjacents gorup by neighbor's address      |
| /adjacents/`<tokenId>`         |Adjacents of the land                      |
| /adjacents/`<x>`,`<y>`         |Adjacents of the land                      |

## Usage

### Install Deno

This tools runs on [Deno](https://deno.land/), the JavaScript engine.

### Clone from Github

```bash
$ git clone https://github.com/babyswaplover/landanalyzer.git
$ cd landanalyzer
```

### Start server

```bash
$ deno run --allow-net=0.0.0.0,ld-api.babyswap.io --allow-read=views main.ts
```

The land data of Baby Wonderland will be fetched when the program executes.  And the land data might be fetched and updated 30 minutes after last fetch.

Access to the local server via Web browser.

```
http://localhost:8000/
```

### About developer

One of BabySwap enthusiasts.
