import { parseFromLog } from "../parsers/seaport/seaportParser";
import { SeaportSale } from '../parsers/seaport/seaportTypes';
import BaseMonitor from "./baseMonitor";

const TARGET_CONTRACTS = [
  "0x00000000006c3852cbEf3e08E8dF289169EdE581" //Seaport 1.1
];

const SEAPORT_TOPICS = [
  "0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31" //OrderFulfilled
];

const SEAPORT_ALLOWED_ZONES = [
  "0x004C00500000aD104D7DBd00e3ae0A5C00560C00" //Ethereum
];


export default class SeaportMonitor extends BaseMonitor {
  async startMonitoring(callback: (sale: SeaportSale) => void): Promise<void> {

    await this.monitorTopics(SEAPORT_TOPICS, 
      async (log) => {
        
        if (TARGET_CONTRACTS.includes(log.address)) {
          try {
            const seaportSale = await parseFromLog(log);

            if (SEAPORT_ALLOWED_ZONES.includes(seaportSale.zone))
              callback(seaportSale);
              
          } catch (error) {
            console.error(error);
          }
        }
      }
    )
  }
}