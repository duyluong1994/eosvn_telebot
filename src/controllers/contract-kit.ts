

import { ABI, APIClient } from '@wharfkit/antelope';
import { ContractKit } from '@wharfkit/contract';
import { RPC_ENDPOINT } from '../../constants';
import eosioTokenABI from '../abis/eosio-token.json';
import eosioABI from '../abis/eosio.json';

const client = new APIClient({ url: RPC_ENDPOINT });
const contractKit = new ContractKit({ client }, {
    abis: [
        { name: 'eosio', abi: ABI.from(eosioABI) },
        { name: 'eosio-token', abi: ABI.from(eosioTokenABI) }
    ]
});

// const get

export { client, contractKit };
