/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import {
  // oak
  Context,
  // jsx
  h,
  renderSSR,
  // landb
  getDate,
  getLands
} from "../deps.ts";
import type { Land } from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandLocation,
  LandType
 } from "./widgets.tsx";

export class FindMerge extends Handler {
  static path = "/findMerge/:size";

  static handle(context:Context) {
    const size = Number(context.params.size);

    // STEP-1: Extract onMarket
    let lands = getLands().filter((land)=>{
      return land.onMarket && land.regionWeight == 1
    });

    // STEP-2: Map of '(x,y)' => land 
    let map = lands.reduce((map, land) => {
      map.set(`(${land.x},${land.y})`, land);
      return map;
    }, new Map<String,Land>());

    const merges:Land[][] = [];
    loop: for (const [key, land] of map.entries()) {
      const adjacents:Land[] = [];
      for (let y=land.y+size-1; y>=land.y; y--) {
        for (let x=land.x; x<land.x+size; x++) {
          // 自身も含める
          const key = `(${x},${y})`;
          const adjacent = map.get(key);
          if (adjacent) {
            adjacents.push(adjacent);
          } else {
            continue loop;
          }
        }
      }
      merges.push(adjacents);
    }

    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = renderSSR(
      <FindMerge
        date={getDate()}
        merges={merges}
      />
    )
  }

  /** render */
  render() {
    return (
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet" />
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" />
          {/* DataTable */}
          <script src="https://code.jquery.com/jquery-3.6.1.slim.min.js"></script>
          <link href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css" rel="stylesheet" />
          <script src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.min.js" />
          <title>Baby Wonderland Analyzer</title>
        </head>
        <body>
          <div class="container">
            <h2>Baby Wonderland Analyzer</h2>
            <hr class="w-100" />
            <h5 style="text-align:right">Fetched: {this.props.date} (UTC)</h5>

            {this.props.merges.length > 0 ?
              <this.mergeLand
                merges = {this.props.merges}
              /> :
              <div>
                Not Found
              </div>
            }
          </div>
        </body>
      </html>
    );
  }

  mergeLand(props) {
    return (
      <div class="row">
      <table class="table">
        <thead>
          <tr>
            <th>Land Type</th>
            {props.merges[0].map((merge, index)=>(
            <th>{index + 1}</th>
            ))}
{
/* TODO: The cost fetched from NET Market
            <th>Cost</th>
*/
}
          </tr>
        </thead>
        <tbody>
        {props.merges.map((merge)=>(
          <tr>
            <td><LandType landType={merge[0].landType} /></td>
            {merge.map((land)=>(
            <td><LandLocation x={land.x} y={land.y} /></td>
            ))}
{
/* TODO: The cost fetched from NET Market
            <td>★</td>
*/
}
          </tr>
        ))}
        </tbody>
      </table>
    </div>)
  }
}
