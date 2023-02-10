import Web3 from "web3";
import { Log } from 'web3-core';
import { Subscription } from 'web3-core-subscriptions';
import { Socket } from "net";

const WEB3_OPTIONS = {
  reconnect: {
    auto: true,
    delay: 2500,
    maxAttempts: 5,
    onTimeout: false
  }
} as unknown as Socket;

const SUBSCRIPTION_TYPE = "logs";


export default abstract class BaseMonitor {
  protected provider: Web3;
  private pastSubscription: Subscription<Log>;

  constructor(providerUrl: string) {
    this.provider = new Web3(providerUrl, WEB3_OPTIONS);
  }

  async isConnected(): Promise<boolean> {
    return await this.provider.eth.net.isListening();
  }

  protected async monitorTopics(topics: string[], callback: (log: Log) => void): Promise<void> {
    if (this.pastSubscription)
      await this.pastSubscription.unsubscribe();

    this.pastSubscription = this.provider.eth.subscribe(SUBSCRIPTION_TYPE, { topics }, (err, log) => {
        if (!err && !log.removed) {
          log.topics.shift();
          callback(log);
        }
      }
    );
  }

  abstract startMonitoring(callback: (sale: any) => void): Promise<void>;
}