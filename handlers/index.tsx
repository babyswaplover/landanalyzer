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
  LandLevel,
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
        counts={getCounts(undefined, true)}
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
    // getCounts() -> [{landType, regionWeight, level, count}...]の内容を{landType, regionWeight}でまとめる
    const rows:{[key:string]: number}[] = [];
    let last:{[key:string]: number}|undefined;
    for (const count of props.counts) {
      if (last &&
          last.landType     == count.landType &&
          last.regionWeight == count.regionWeight) {
        switch (count.level) {
          case 1: // normal
            last.normal += count.count;
            break;
          case 2: // premium
            last.premium += count.count;
            break;
          default:
            // TODO
        }
        last.total += count.count;
      } else {
        // Append new row
        last = {
          landType: count.landType,
          regionWeight: count.regionWeight,
          normal: (count.level == 1) ? count.count : 0,
          premium: (count.level == 2) ? count.count : 0,
          total: count.count
        };
        rows.push(last);
      }
    }

    return (
      <div class="row">
      <h3>Summary</h3>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Island</th>
            <th>Size</th>
            <th style="text-align:right">Normal</th>
            <th style="text-align:right">Premium</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row)=>(
            <tr>
              <td><LandType landType={row.landType} /></td>
              <td><LandSize size={row.regionWeight} /></td>
              <td style="text-align:right">{row.normal}</td>
              <td style="text-align:right">{row.premium}</td>
              <td style="text-align:right">{row.total}</td>
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
            {props.sizes.map((size:number)=>(
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
              <td><LandAddress address={info.userAddress} name={true} /></td>
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
