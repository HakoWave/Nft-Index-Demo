import Web3 from "web3";
import { AbiItem } from 'web3-utils'
import retry from "async-retry";

export interface TokenInfo {
  address?: string;
  name: string;
  symbol: string;
};

const DUMMY_ABI = [{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

const RESOLVER_PROVIDER = new Web3(process.env.RESOLVER_PROVIDER_URL as string);
const TOKEN_INFO_CACHE = new Map<string, TokenInfo>();


const init = () => {
  TOKEN_INFO_CACHE.set("0x0000000000000000000000000000000000000000", {
    name: "Ethereum",
    symbol: "ETH"
  });

  TOKEN_INFO_CACHE.set("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", {
    name: "Wrapped Ether",
    symbol: "WETH"
  });
};

export const resolveTokenInfo = async(tokenAddress: string): Promise<TokenInfo> => {
  const cachedValue = TOKEN_INFO_CACHE.get(tokenAddress);

  if (cachedValue)
    return cachedValue;

  return await retry(async() => {
    const dummyContractInterface = new RESOLVER_PROVIDER.eth.Contract(DUMMY_ABI as AbiItem[], tokenAddress);
    const tokenName = await dummyContractInterface.methods.name().call() as string;
    const tokenSymbol = await dummyContractInterface.methods.symbol().call() as string;

    return {
      address: tokenAddress,
      name: tokenName,
      symbol: tokenSymbol
    }
  });
};

export const resolveTransactionSender = async(transactionHash: string): Promise<string> => {
  return await retry(async() => {
    const transaction = await RESOLVER_PROVIDER.eth.getTransaction(transactionHash);
    return transaction.from;
  });
};

init();