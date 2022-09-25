# Simple Land Analyzer Web Server for Baby Wonderland

This is simple land data Analysis tool.

This is an example of [landb](https://github.com/babyswaplover/landb) library.  You can customize this by adding routes and views to analyze land data of Baby Wonderland.

## Usage

### clone from Github

```bash
$ git clone https://github.com/babyswaplover/landanalyzer.git
$ cd landanalyzer
```

### Start server

```bash
$ deno run --allow-net=0.0.0.0,ld-api.babyswap.io --allow-read=views src/server.ts
```

The land data of Baby Wonderland will be fetched when the program executes.

### Pages

Access to the local server via Web browser.

```
http://localhost:3000/
```

| Request path              | Description           |
|:--------------------------|:----------------------|
| /                         |Summary of Lands       |
| /address/`<address>`      |Lands owned by address |
| /adjacents/`<tokenId>`    |adjacents of land      |
| /adjacents/`<x>`,`<y>`    |adjacents of land      |
