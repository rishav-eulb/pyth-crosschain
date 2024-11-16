import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { PriceServiceConnection } from "../index";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const priceIds = [
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD price id
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD price id
];
const endpoint = "";


async function run() {
  const connection = new PriceServiceConnection(endpoint, {
    logger: console, // Providing logger will allow the connection to log it's events.
    priceFeedRequestConfig: {
      binary: true,
    },
  });

  const priceIds = priceIds as string[];
  const priceFeeds = await connection.getLatestPriceFeeds(priceIds);
  console.log(priceFeeds);
  console.log(priceFeeds?.at(0)?.getPriceNoOlderThan(60));

  console.log("Subscribing to price feed updates.");

  await connection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
    console.log(
      `Current price for ${priceFeed.id}: ${JSON.stringify(
        priceFeed.getPriceNoOlderThan(60)
      )}.`
    );
    console.log(priceFeed.getVAA());
  });

  await sleep(600000);

  // To close the websocket you should either unsubscribe from all
  // price feeds or call `connection.stopWebSocket()` directly.

  console.log("Unsubscribing from price feed updates.");
  await connection.unsubscribePriceFeedUpdates(priceIds);

  // connection.closeWebSocket();
}

run();
