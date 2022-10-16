/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import {
  h,
} from "../deps.ts";

/**
 * LandAddress Component
 * @param props attribute:address
 * @returns 
 */
 export function LandAddress(props) {
  return (
    <span class="font-monospace">
      <a rel="noreferrer" href={`https://home.babyswap.finance/did/${props.address}`}>[DID]</a>
      <a href={`/address/${props.address}`}>{props.address}</a>
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
