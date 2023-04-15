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
  getCounts,
  getLands
} from "../deps.ts";
import type { Land } from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandAddress,
  LandLocation,
  LandOnMarket,
  LandSize,
  LandLevel
 } from "./widgets.tsx";

export class Address extends Handler {
  static path = "/address/:address";

  static handle(context:Context) {
    const address = context.params.address;
    const lands = getLands(address);
    const total = lands.reduce((total, land)=>total + land.regionWeight**2, 0);

    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = renderSSR(
      <Address
        date={getDate()}
        address={address}
        total={total}
        counts={getCounts(address)}
        lands={lands}
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
            <this.myAddress
              address={this.props.address}
              total={this.props.total}
              counts={this.props.counts}
            />

            <this.myLand
              lands={this.props.lands}
            />

            <div class="row">
              <h3><a href={`/address/${this.props.address}/adjacents`}>Adjacent List</a></h3>
              <h3><a href={`/address/${this.props.address}/neighbors`}>Neighbor List</a></h3>
            </div>
          </div>
        </body>
      </html>
    );
  }

  myAddress(props) {
    return (
      <div class="row">
        <table class="table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Size</th>
              <th>Type</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><LandAddress address={props.address} name={true} /></td>
              <td></td>
              <td></td>
              <td style="text-align:right">{props.total}</td>
            </tr>
            {props.counts.map((count)=>(
              <tr>
              <td></td>
              <td><LandSize size={count.regionWeight} /></td>
              <td><LandLevel level={count.level} /></td>
              <td style="text-align:right">{count.count}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  myLand(props) {
    return (
      <div class="row">
        <h3>My Lands</h3>
        <table id="landTable" class="table table-striped">
          <thead>
            <tr>
              <th>TokenId</th>
              <th>Location</th>
              <th>Size</th>
              <th>Type</th>
              <th>Adjacents</th>
            </tr>
          </thead>
          <tbody>
          {props.lands.map((land:Land)=>(
            <tr>
              <td><LandOnMarket tokenId={land.tokenId} /></td>
              <td><LandLocation x={land.x} y={land.y} /></td>
              <td><LandSize size={land.regionWeight} /></td>
              <td><LandLevel level={land.level} /></td>
              <td><a href={`/adjacents/${land.tokenId}`}>Check</a></td>
            </tr>
          ))}
          </tbody>
        </table>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              $(document).ready(() => {
                $('#landTable').DataTable({
                  pageLength: 10,
                  ordering: false
                });
              });
              `
          }}
        />
      </div>
    );
  }
}
