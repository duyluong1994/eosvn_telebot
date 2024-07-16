import { ABI } from '@wharfkit/antelope';
import { Table } from '@wharfkit/contract';
import { EOS_VN, EOSIO, EOSIO_WRAM, RAM_DEFI, RAMBANK_EOS } from '../../constants';
import eosioWramABI from '../abis/eosio-wram.json';
import eosioABI from '../abis/eosio.json';
import ramDefiABI from '../abis/ram-defi.json';
import rambankEosABI from '../abis/rambank-eos.json';
import rewardEosVnABI from '../abis/reward-eosvn.json';
import { client } from './contract-kit';




const checkRamBalance = async (accountName: string) => {
    let totalbytes = 0;
    // Get native RAM balance
    const eosioContract = new Table({
        abi: ABI.from(eosioABI),
        account: EOSIO.CONTRACT_NAME,
        name: EOSIO.TABLE.USER_RESOURCES,
        client,
    });
    const nativeRam = await eosioContract.get(undefined, { scope: accountName });
    if (!nativeRam) {
        console.log(accountName, "not found native RAM");
    } else {
        totalbytes = nativeRam.ram_bytes.toNumber();

    }

    // Get BRAM balance from DEFIBOX
    const ramDefiContract = new Table({
        abi: ABI.from(ramDefiABI),
        account: RAM_DEFI.CONTRACT_NAME,
        name: RAM_DEFI.TABLE.ACCOUNTS,
        client,
    });
    const bram = await ramDefiContract.get(undefined, { scope: accountName });
    if (!bram) {
        console.log(accountName, "not found BRAM");

    } else {
        totalbytes += bram.balance.units.toNumber();

    }

    // Get WRAM balance from eosio.wram
    const wramContract = new Table({
        abi: ABI.from(eosioWramABI),
        account: EOSIO_WRAM.CONTRACT_NAME,
        name: EOSIO_WRAM.TABLE.ACCOUNTS,
        client,
    });
    const wram = await wramContract.get(undefined, { scope: accountName });
    if (!wram) {
        console.log(accountName, "not found WRAM");

    } else {
        totalbytes += wram.balance.units.toNumber();

    }

    // GET RAM bytes from rambank.eos
    const rambankEosContract = new Table({
        abi: ABI.from(rambankEosABI),
        account: RAMBANK_EOS.CONTRACT_NAME,
        name: RAMBANK_EOS.TABLE.DEPOSITS,
        client,
    });
    const rambank = await rambankEosContract.get(accountName);
    if (!rambank) {
        console.log(accountName, "not found rambank");

    } else {
        totalbytes += rambank.bytes.toNumber();

    }

    return {
        account: accountName,
        totalbytes: totalbytes,
        ram: !nativeRam ? 0 : nativeRam.ram_bytes.toNumber(),
        bram: !bram ? 0 : bram.balance.units.toNumber(),
        wram: !wram ? 0 : wram.balance.units.toNumber(),
        rambank: !rambank ? 0 : rambank.bytes.toNumber()
    };
};

const memberRamManage = async (bot: any) => {
    // get all members from EOS VN contract
    const eosvnContract = new Table({
        abi: ABI.from(rewardEosVnABI),
        account: EOS_VN.CONTRACT_NAME,
        name: EOS_VN.TABLE.MEMBERS,
        client,
    });

    const membersCursor = eosvnContract.query();
    const members = await membersCursor.all();

    for (const member of members) {
        let ramBalance = await checkRamBalance(String(member.account));
        const { isPassed, bytes_to_pass } = checkRamRules(ramBalance.totalbytes, member.verified_at.toDate());
        if (!isPassed) {
            // await bot.telegram.banChatMember(EOSVN_BP_CHAT_ID, member.telegram_id, Math.floor(Date.now() / 1000) + 60).catch((err: any) => {
            //     console.log(err)
            // });
            await bot.telegram.sendMessage(member.telegram_id, `Tài khoản của bạn: ${member.account} không đủ RAM để tham gia cộng đồng. Bạn cần thêm ${bytes_to_pass} bytes RAM để tham gia cộng đồng. Sau đó gọi lệnh /verify để kiểm tra lại.`).catch((err: any) => {
                console.log(err)
            });
        }
    }
};

const checkRamRules = (bytes: number, verified_at: Date) => {
    // the rules for RAM balance are:
    // if verified_at is less than a week, the RAM balance must be greater than 1MB
    // if verified_at is more than a week but less than two weeks, the RAM balance must be greater than 2MB
    // keep increasing 1MB for each week until 5 weeks (5MB)
    // if verified_at is more than 5 weeks, the RAM balance must be greater than 5MB
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - verified_at.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
        const isPassed = bytes >= 1 * 1024 * 1024;
        const bytes_to_pass = isPassed ? 0 : 1 * 1024 * 1024 - bytes;
        return { isPassed, bytes_to_pass };
    } else if (diffDays <= 14) {
        const isPassed = bytes >= 2 * 1024 * 1024;
        const bytes_to_pass = isPassed ? 0 : 2 * 1024 * 1024 - bytes;
        return { isPassed, bytes_to_pass };
    } else if (diffDays <= 21) {
        const isPassed = bytes >= 3 * 1024 * 1024;
        const bytes_to_pass = isPassed ? 0 : 3 * 1024 * 1024 - bytes;
        return { isPassed, bytes_to_pass };
    } else if (diffDays <= 28) {
        const isPassed = bytes >= 4 * 1024 * 1024;
        const bytes_to_pass = isPassed ? 0 : 4 * 1024 * 1024 - bytes;
        return { isPassed, bytes_to_pass };
    } else {
        const isPassed = bytes >= 5 * 1024 * 1024;
        const bytes_to_pass = isPassed ? 0 : 5 * 1024 * 1024 - bytes;
        return { isPassed, bytes_to_pass };
    }
}

const getMember = async (telegram_id: string) => {
    // get single member from EOS VN contract
    const eosvnContract = new Table({
        abi: ABI.from(rewardEosVnABI),
        account: EOS_VN.CONTRACT_NAME,
        name: EOS_VN.TABLE.MEMBERS,
        client,
    });

    const member = await eosvnContract.get(telegram_id);
    return member;
};

export { checkRamBalance, checkRamRules, getMember, memberRamManage };

