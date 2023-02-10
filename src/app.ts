import { fromWei } from "web3-utils";
import SeaportMonitor from "./monitors/seaportMonitor";

const seaportMonitor = new SeaportMonitor(process.env.MONITOR_PROVIDER_URL as string);

seaportMonitor.startMonitoring((sale) => {
  console.log("\n########## New Seaport Sale ##########");
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`   Tx Hash: ${sale.transactionHash}`);
  console.log(`   Seller: ${sale.seller}`);
  console.log(`   Buyer: ${sale.buyer}`);
  console.log(`   Purchase Price: ${fromWei(sale.payment.amount, "ether")} ${sale.payment.asset.symbol}`);
  console.log(`   Items:`);

  sale.items.forEach((item) => {
    console.log(`\n     - ${item.amount}x ${item.collection.name} | #${item.identifier} (${item.itemType})`);
    console.log(`         Link: https://opensea.io/assets/ethereum/${item.collection.address}/${item.identifier}`);
  });
});