
import 'dotenv/config';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN : "";
const DB = process.env.DB ? process.env.DB : "";
const DBUSER = process.env.DBUSER ? process.env.DBUSER : "";
const DBPASS = process.env.DBPASS ? process.env.DBPASS : "";
const DBHOST = process.env.DBHOST ? process.env.DBHOST : "";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8088;
const RPC_ENDPOINT = process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : "";
const EOSVN_BP_CHAT_ID = process.env.EOSVN_BP_CHAT_ID ? process.env.EOSVN_BP_CHAT_ID : "";

// EOS mainnet 
const EOSIO = {
    CONTRACT_NAME: "eosio",
    TABLE: {
        USER_RESOURCES: "userres",
    }
};

const EOSIO_TOKEN = {
    CONTRACT_NAME: "eosio.token",
    TABLE: {
        ACCOUNT: "accounts",
        STAT: "stat"
    }

}

const EOS_VN = {
    CONTRACT_NAME: "reward.eosvn",
    TABLE: {
        MEMBERS: "members"
    }
}

const RAM_DEFI = {
    CONTRACT_NAME: "ram.defi",
    TABLE: {
        ACCOUNTS: "accounts"
    }
}

const EOSIO_WRAM = {
    CONTRACT_NAME: "eosio.wram",
    TABLE: {
        ACCOUNTS: "accounts"
    }
}

const RAMBANK_EOS = {
    CONTRACT_NAME: "rambank.eos",
    TABLE: {
        DEPOSITS: "deposits"
    }
}

//export all these constants
export {
    DB, DBHOST, DBPASS, DBUSER,
    EOSIO, EOSIO_TOKEN, EOSIO_WRAM, EOSVN_BP_CHAT_ID, EOS_VN, PORT, RAMBANK_EOS, RAM_DEFI, RPC_ENDPOINT, TELEGRAM_BOT_TOKEN
};

