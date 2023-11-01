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
  getAdjacentLands,
  getLands,
} from "../deps.ts";
import type { Land } from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandAddress,
  LandType,
  LandLocation,
  LandSize,
  LandLevel,
  LandOnMarket
} from "./widgets.tsx";

export class AddressAdjacents extends Handler {
  static path = "/address/:address/adjacents";

  static handle(context:Context) {
    const address = context.params.address;
    // Land with adjacents
    interface Adjacent extends Land {
      adjacents: Land[]
    }
    const lands = getLands(address);
    for (const land of lands) {
      const adjacents = getAdjacentLands(land);
      (land as unknown as Adjacent).adjacents = adjacents;
    }
    
    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = renderSSR(
      <AddressAdjacents
        date={getDate()}
        address={address}
        lands={lands}
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

            <this.adjacents
              lands={this.props.lands}
            />

          </div>
        </body>
      </html>
    );
  }

  adjacents(props) {
    return (
      <div class="row">
        <h3>Adjacents</h3>
        <table class="table">
          <thead>
            <tr>
              {/* myland */}
              <th>TokenId</th>
              <th>Island</th>
              <th>Location</th>
              <th>Size</th>
              <th>Type</th>
              <th>Adjacents</th>
              {/* adjacents */}
              <th>Location</th>
              <th>Size</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Market</th>
            </tr>
          </thead>
          <tbody>
          {props.lands.map((land)=>(
            <Fragment>
              <tr>
                {/* myland */}
                <td><LandOnMarket tokenId={land.tokenId} /></td>
                <td><LandType landType={land.landType} /></td>
                <td><LandLocation x={land.x} y={land.y} /></td>
                <td><LandSize size={land.regionWeight} /></td>
                <td><LandLevel level={land.level} /></td>
                <td style="text-align:right">{land.adjacents.length}</td>
                {/* adjacents */}
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              {land.adjacents.map((adjacent:Land)=>(
              <tr>
                {/* myland */}
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                {/* adjacents */}
                <td><LandLocation x={adjacent.x} y={adjacent.y} /></td>
                <td><LandSize size={adjacent.regionWeight} /></td>
                <td><LandLevel level={adjacent.level} /></td>
                <td>
                  {land.userAddress == adjacent.userAddress
                    ? <span>owned</span>
                    : <LandAddress address={adjacent.userAddress} name={true} />
                  }
                </td>
                <td>{adjacent.onMarket==1 && <LandOnMarket tokenId={adjacent.tokenId} />}</td>
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
