/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import {
  h,
} from "../deps.ts";

// Known Address
const walletName = {
  "0x3a952c1a235fe9ac5dc4baa2c0c73595ec5a70e8": "BabySwap",
  "0x03eb3db6188d7f89031c580734162acac796594c": "CoinMarketCap",
  "0x1d16d9a94bee3080521b55f94822b57a18797a0c": "BNB Chain",
  "0x2e655e85c83cec7894e8cdcc134b9acb53acbec1": "",
  "0x47f28b642aff0b12efb1c48ec55c731730283353": "",
  "0x51b411c91964ecbb205db700703c1e7b68dc7e2d": "",
  "0x70dd100d396c438f5dfccdbb07e59eb6885429c4": "Baby Wealthy Club",
  "0x78293432a5dc600bbff6dc2919d6c7626b26c4ef": "",
  "0x99f2a70a48e3761613b3ae4eb0c8022dac8930b4": "",
  "0x9d85f34be395a63efa990191a6cab0cdfa96c3c0": "Binance",
  "0xef87ad392125f18ba7dfc66c048216b99dba8b46": "ApolloX"
};

/**
 * LandAddress Component
 * @param props attribute:address, name(optional)
 * @returns 
 */
 export function LandAddress(props) {
  const name = walletName[props.address];
  return (
    <span class="font-monospace">
      <a href={`/address/${props.address}`}>{props.address}</a>
      &nbsp;
      <a rel="noreferrer" href={`https://home.babyswap.finance/did/${props.address}`}>[DID]</a>
      {props.name && name && <span>({name})</span>}
    </span>
  );
}

/**
 * LandLocation Component
 * @param props attribute:x, y
 * @returns 
 */
 export function LandLocation(props) {
  return (
    <a href={`https://land.babyswap.finance/land?x=${props.x}&y=${props.y}`}>({props.x},{props.y})</a>
  )
}

/**
 * LandSize Component
 * @param props attribute:size
 * @returns 
 */
export function LandSize(props) {
  return (
    <span>{props.size}x{props.size}</span>
  )
}

/**
 * LandType Component
 * @param props attribute:level
 * @returns 
 */
export function LandType(props) {
  return (
    <span>{props.level==2 ? 'Premium' : 'Normal'}</span>
  )
}

/**
 * LandOnMarket Component
 * @param props attribute:tokenId
 * @returns 
 */
export function LandOnMarket(props) {
  return (
    <a href={`https://market.babyswap.finance/nfts/collection/0x1fe7f243eb49f3b9575f51a2f9fba9fc2c1dd68d/${props.tokenId}`}>{props.tokenId}</a>
  )
}
