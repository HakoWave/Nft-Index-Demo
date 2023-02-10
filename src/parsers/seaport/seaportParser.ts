import Web3 from "web3";
import { Log } from 'web3-core';
import { resolveTokenInfo, resolveTransactionSender } from "../../utilities/rpcUtilities";
import { ORDERFULFILLED_STRUCT, SeaportSale, SaleItemCatchAll, ItemType, SeaportSaleItem } from "./seaportTypes";

const ABI_CODER = new Web3().eth.abi;


export const parseFromLog = async (log: Log): Promise<SeaportSale> => {
    const decodedLog = ABI_CODER.decodeLog(ORDERFULFILLED_STRUCT, log.data, log.topics);

    if (!decodedLog) {
        throw new Error(`Unable to decode Seaport logs from ${log.transactionHash}`);
    }

    const offerItems = decodedLog.offer as unknown as SaleItemCatchAll[];
    const considerationItems = decodedLog.consideration as unknown as SaleItemCatchAll[];
    const areNftsInOffer = offerItems.find(i => isNftItem(i.itemType));

    if (areNftsInOffer)
        return await parseFromStandardLog(log, decodedLog, offerItems, considerationItems);
    else
        return await parseFromAdvancedLog(log, decodedLog, offerItems, considerationItems);
};

const parseFromStandardLog = async (log: Log, decodedLog: any, offerItems: SaleItemCatchAll[], considerationItems: SaleItemCatchAll[]): Promise<SeaportSale> => {
    const paymentAsset = await resolveTokenInfo(considerationItems[0].token);
    const paymentTotal =considerationItems.reduce((acc, obj) => acc + parseInt(obj.amount), 0);

    const items = await Promise.all(
        offerItems.filter(i => isNftItem(i.itemType))
            .map(i => convertCatchAllToSaleItem(i))
    );
    
    return {
        transactionHash: log.transactionHash,
        zone: decodedLog.zone,
        seller: decodedLog.offerer,
        buyer: decodedLog.recipient,
        items,
        payment: {
            asset: paymentAsset,
            amount: paymentTotal.toString()
        }
    };
};

//Could be bids or complex multi-contract interactions
const parseFromAdvancedLog = async (log: Log, decodedLog: any, offerItems: SaleItemCatchAll[], considerationItems: SaleItemCatchAll[]): Promise<SeaportSale> => {
    const seller = await resolveTransactionSender(log.transactionHash);
    const buyer =  considerationItems.find(i => isNftItem(i.itemType))?.recipient as string;

    const paymentAsset = await resolveTokenInfo(offerItems[0].token);
    const paymentTotal = offerItems.reduce((acc, obj) => acc + parseInt(obj.amount), 0);

    const items = await Promise.all(
        considerationItems.filter(i => isNftItem(i.itemType))
            .map(i => convertCatchAllToSaleItem(i))
    );
    
    return {
        transactionHash: log.transactionHash,
        zone: decodedLog.zone,
        seller,
        buyer,
        items,
        payment: {
            asset: paymentAsset,
            amount: paymentTotal.toString()
        }
    };
};

const convertCatchAllToSaleItem = async (item: SaleItemCatchAll): Promise<SeaportSaleItem> => {
    return {
        itemType: itemTypeToString(item.itemType),
        collection: await resolveTokenInfo(item.token),
        identifier: item.identifier,
        amount: item.amount
    }
};

const isNftItem = (itemType: ItemType) => {
    switch(itemType) {
        case ItemType.ERC721:
        case ItemType.ERC721_WITH_CRITERIA:
        case ItemType.ERC1155:
        case ItemType.ERC1155_WITH_CRITERIA:
            return true;

        default:
            return false;
    }
};

const itemTypeToString = (itemType: ItemType) => {
    switch(itemType) {
        case ItemType.ERC721:
        case ItemType.ERC721_WITH_CRITERIA:
            return "ERC-721";
        case ItemType.ERC1155:
        case ItemType.ERC1155_WITH_CRITERIA:
            return "ERC-1155";
        case ItemType.ERC20:
            return "ERC-20";

        default:
            return "Native";
    }
};