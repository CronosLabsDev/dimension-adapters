import * as sdk from "@defillama/sdk";
import { Chain } from "@defillama/sdk/build/general";
import request, { gql } from "graphql-request";
import { Adapter, FetchOptions } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

interface IData {
  totalTradeFee: string;
}

interface IProtocolData {
  protocolByDay: IData;
  protocol: IData;
}

type IURL = {
  [l: string | Chain]: string;
};

const endpoints: IURL = {
  [CHAIN.CELO]: sdk.graph.modifyEndpoint('DGN3dMffNnXZRAHFyCAq3csJbe2o7g9Jdg2XHe2mzVdG'),
};

const fetch = (chain: Chain) => {
  return async ({ startOfDay }: FetchOptions) => {
    const graphQuery = gql`
      {
        protocolByDay(id: "${startOfDay}") {
          totalTradeFee
        }
        protocol(id: "1") {
          totalTradeFee
        }
      }
    `;

    const res: IProtocolData = await request(endpoints[chain], graphQuery);
    const dailyFees = Number(res.protocolByDay.totalTradeFee) / 10 ** 18;
    const totalFees = Number(res.protocol.totalTradeFee) / 10 ** 18;

    return {
      dailyFees: dailyFees.toString(),
      totalFees: totalFees.toString(),
    };
  };
};

const adapter: Adapter = {
  adapter: {
    [CHAIN.CELO]: {
      fetch: fetch(CHAIN.CELO),
      start: 1690848000,
    },
  },
  version: 2
};

export default adapter;
