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
  Fragment,
  // landb
  getDate,
  getNeighbors
} from "../deps.ts";
import type { Land } from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandAddress,
  LandLocation,
  LandSize,
  LandType,
  LandOnMarket
} from "./widgets.tsx";

export class AddressNeighbors extends Handler {
  static path = "/address/:address/neighbors";

  static handle(context:Context) {
    const address = context.params.address;

    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = renderSSR(
      <AddressNeighbors
        date={getDate()}
        address={address}
        neighbors={Array.from(getNeighbors(address).entries())}
      />
    );
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
          <title>Baby Wonderland Analyzer</title>
        </head>
        <body>
          <div class="container">
            <h2>Baby Wonderland Analyzer</h2>
            <hr class="w-100" />
            <h5 style="text-align:right">Fetched: {this.props.date} (UTC)</h5>

            <this.neighbors
              neighbors={this.props.neighbors}
            />

          </div>
        </body>
      </html>
    );
  }

  neighbors(props) {
    return (
      <div class="row">
        <h3>Neighbors</h3>
        <table class="table">
          <thead>
            <tr>
              {/* neighbor */}
              <th>Neighbor's Address</th>
              <th>Count</th>
              {/* lands */}
              <th>TokenId</th>
              <th>Location</th>
              <th>Size</th>
              <th>Type</th>
              <th>Market</th>
            </tr>
          </thead>
          <tbody>
            {props.neighbors.map(([address, lands])=>(
              <Fragment>
                <tr>
                  <td><LandAddress address={address} /></td>
                  <td style="text-align:right">{lands.length}</td>
                  {/* lands */}
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                {lands.map((land)=>(
                  <tr>
                    {/*  neighbor */}
                    <td></td>
                    <td></td>
                    {/*  lands */}
                    <td>{land.tokenId}</td>
                    <td><LandLocation x={land.x} y={land.y} /></td>
                    <td><LandSize size={land.regionWeight} /></td>
                    <td><LandType level={land.level} /></td>
                    <td>{land.onMarket ==1 && <LandOnMarket tokenId={land.tokenId} />}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
