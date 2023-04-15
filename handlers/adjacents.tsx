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
  getAdjacentLands,
  getLandByTokenId,
  getLandByLocation
} from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandAddress,
  LandLocation,
  LandSize,
  LandLevel,
  LandOnMarket,
  LandType
} from "./widgets.tsx";

export class Adjacents extends Handler {
  static path = "/adjacents/:tokenId";

  static handle(context:Context) {
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
      context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
      context.response.body = renderSSR(
        <Adjacents
          date={getDate()}
          land={land}
          adjacents={getAdjacentLands(land)}
        />
      );
    }
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

            <this.myland
              land={this.props.land}
            />

            <this.adjacents
              land={this.props.land}
              adjacents={this.props.adjacents}
            />

          </div>
        </body>
      </html>
    );
  }

  myland(props) {
    const land = props.land;
    return (
      <div class="row">
      <table class="table">
        <thead>
          <tr>
            <th>Address</th>
            <th>TokeId</th>
            <th>Island</th>
            <th>Size</th>
            <th>Type</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-monospace">{land.userAddress}</td>
            <td><LandOnMarket tokenId={land.tokenId} /></td>
            <td><LandType landType={land.landType} /></td>
            <td><LandSize size={land.regionWeight} /></td>
            <td><LandLevel level={land.level} /></td>
            <td><LandLocation x={land.x} y={land.y} /></td>
          </tr>
        </tbody>
      </table>
    </div>
    );
  }

  adjacents(props) {
    return (
      <div class="row">
        <h3>Adjacents</h3>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Location</th>
              <th>TokeId</th>
              <th>Size</th>
              <th>Type</th>
              <th>Owner</th>
              <th>On Market</th>
            </tr>
          </thead>
          <tbody>
            {props.adjacents.map((adjacent)=>(
              <tr>
                <td><LandLocation x={adjacent.x} y={adjacent.y} /></td>
                <td><LandOnMarket tokenId={adjacent.tokenId} /></td>
                <td><LandSize size={adjacent.regionWeight} /></td>
                <td><LandLevel level={adjacent.level} /></td>
                <td>
                  {props.land.userAddress == adjacent.userAddress
                    ? <span>owned</span>
                    : <LandAddress address={adjacent.userAddress} name={true} />
                  }
                </td>
                <td>{adjacent.onMarket==1 && <LandOnMarket tokenId={adjacent.tokenId} />}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}
