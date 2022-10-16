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
  getOwnerInfoMap,
} from "../deps.ts";
import { Handler } from "./handler.tsx";
import {
  LandAddress,
  LandSize,
  LandType
} from "./widgets.tsx";

export class Index extends Handler {
  static path = "/";

  static handle(context:Context) {
    // Total count
    const ownerInfo = getOwnerInfoMap();
    const totalCounts = [...ownerInfo].reduce((totalCounts, entry)=>{
      return entry[1].counts.reduce((_, count, index)=>{
        totalCounts[index] = (totalCounts[index] ?? 0) + count
        return totalCounts;
      }, totalCounts);
    }, []);
    const sizes = totalCounts.reduce((sizes, count, index)=>{
      if (count) {
        sizes.push(index);
      }
      return sizes;
    }, []);
    const owners = Array.from(ownerInfo.values());

    context.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    context.response.body = renderSSR(
      <Index
        date={getDate()}
        counts={getCounts()}
        owners={owners}
        sizes={sizes}
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
            <this.summary
              counts={this.props.counts}
            />
            <this.topHolders
              sizes={this.props.sizes}
              owners={this.props.owners}
            />
          </div>
        </body>
      </html>
    );
  }

  summary(props) {
    return (
      <div class="row">
      <h3>Summary</h3>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Size</th>
            <th>Type</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.counts.map((count)=>(
            <tr>
              <td><LandSize size={count.regionWeight} /></td>
              <td><LandType level={count.level} /></td>
              <td style="text-align:right">{count.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
  }

  topHolders(props) {
    let no = 1;
    return (
      <div class="row">
      <h3>Top Holders</h3>
      <table id="holderTable" class="table table-striped">
        <thead>
          <tr>
            <th>No</th>
            <th>Address</th>
            {props.sizes.map((size)=>(
              <th style="text-align:right">
                { size == 0 ? 'Total' : <LandSize size={size} /> }
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
        {props.owners.map((info)=>(
            <tr>
              <td>{no++}</td>
              <td><LandAddress address={info.userAddress} /></td>
              { props.sizes.map((size)=>(
                <td style="text-align:right">{info.counts[size]}</td>
              ))}
            </tr>
          ))
        }
        </tbody>
      </table>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            $(document).ready(() => {
              $('#holderTable').DataTable({
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
