import { TokenInfo } from "../../utilities/rpcUtilities";

export const ORDERFULFILLED_STRUCT = [
  {
    type: "bytes32",
    name: "orderHash",
  },
  {
    type: "address",
    name: "offerer",
    indexed: true
  },
  {
    type: "address",
    name: "zone",
    indexed: true
  },
  {
    type: "address",
    name: "recipient",
  },
  {
    type: "tuple[]",
    name: "offer",
    components: [
      {
        type: "uint8",
        name: "itemType",
      },
      {
          type: "address",
          name: "token",
      },
      {
          type: "uint256",
          name: "identifier",
      },
      {
          type: "uint256",
          name: "amount",
      }
    ]
  },
  {
    type: "tuple[]",
    name: "consideration",
    components: [
      {
        type: "uint8",
        name: "itemType",
      },
      {
          type: "address",
          name: "token",
      },
      {
          type: "uint256",
          name: "identifier",
      },
      {
          type: "uint256",
          name: "amount",
      },
      {
          type: "address",
          name: "recipient",
      }
    ]
  }
];

export enum ItemType {
  NATIVE = "0",
  ERC20 = "1",
  ERC721 = "2",
  ERC1155 = "3",
  ERC721_WITH_CRITERIA = "4",
  ERC1155_WITH_CRITERIA = "5"
};

export interface SaleItemCatchAll {
  itemType: ItemType;
  token: string;
  identifier: string;
  amount: string;
  recipient: string;
};

export interface SeaportSale {
  transactionHash: string;
  zone: string;
  seller: string;
  buyer: string;
  items: SeaportSaleItem[];
  payment: {
    asset: TokenInfo;
    amount: string;
  }
};

export interface SeaportSaleItem {
  itemType: string;
  collection: TokenInfo;
  identifier: string;
  amount: string;
};