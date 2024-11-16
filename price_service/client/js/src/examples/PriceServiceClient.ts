import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { PriceServiceConnection } from "../index";
import { EthereumConnection } from "./EthereumConnection";

class TokenPriceMonitor {
  constructor(endpoint, rpcUrl, walletAddress, tokenAddresses) {
    this.endpoint = endpoint;
    this.rpcUrl = rpcUrl;
    this.walletAddress = walletAddress;
    this.tokenAddresses = tokenAddresses;
    this.priceIds = [
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD price id
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD price id
];
    this.connection = new PriceServiceConnection(endpoint, {
      logger: console,
      priceFeedRequestConfig: { binary: true },
    });
    this.ethereumConnection = new EthereumConnection(rpcUrl);
  }

  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTokenData() {
    const priceFeeds = await this.connection.getLatestPriceFeeds(this.priceIds);

    const tokenData = await Promise.all(
      priceFeeds.map(async (feed) => {
        const symbol =
          feed.id === "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
            ? "BTC/USD"
            : feed.id === "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
            ? "ETH/USD"
            : "Unknown";

        const tokenAddress =
          symbol === "BTC/USD" ? this.tokenAddresses.BTC : this.tokenAddresses.ETH;

        const balance = await this.ethereumConnection.getErc20Balance(
          this.walletAddress,
          tokenAddress
        );

        return {
          tokenSymbol: symbol,
          emaPrice: feed.emaPrice.price,
          tokenBalance: balance,
        };
      })
    );

    // Fetch USDC balance and add it to the tokenData array
    const usdcBalance = await this.ethereumConnection.getErc20Balance(
      this.walletAddress,
      this.tokenAddresses.USDC
    );

    tokenData.push({
      tokenSymbol: "USDC",
      emaPrice: 1, // No price check needed
      tokenBalance: usdcBalance,
    });

    return tokenData;
  }
 
  async run() {
    console.log("Fetching token data...");
    const tokenData = await this.getTokenData();
    console.log("Token Data:");
    console.log(tokenData);

  }
}

export default TokenPriceMonitor;


