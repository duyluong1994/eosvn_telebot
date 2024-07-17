// const { Telegraf } = require('telegraf');
import cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { EOSVN_BP_CHAT_ID, TELEGRAM_BOT_TOKEN } from '../constants';
import { checkRamBalance, checkRamRules, getMember, memberRamManage } from './controllers/ram-master';
import { privateChatOnly } from './middlewares';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx: any) => {
    ctx.reply('Welcome!')
});
bot.help((ctx: any) => {
    ctx.reply(`Nếu bạn có vấn đề gì trong quá trình xác thực thì liên hệ sys admin qua: https://t.me/mr_eosio`);
});

bot.command("register", privateChatOnly, async (ctx: any) => {
    const userId = ctx.from.id;
    const member = await getMember(userId);
    if (member) {
        await ctx.reply(`Bạn đã đăng ký thành viên với tài khoản: ${member.account} từ ngày ${member.verified_at.toDate()}. \nHãy kiểm tra lại thông tin và xác thực tài khoản bằng lệnh /verify`);
        return;
    }
    await ctx.reply(`Hãy dùng EOS account có sở hữu 1 trong các loại tài sản sau: RAM, BRAM, WRAM, RAMS hoặc đã gửi cho RAMS DAO thuê để kí giao dịch đăng ký thành viên __*regmember*__ ở hợp đồng thông minh __*reward\\.eosvn*__ \\. 
            \nĐiền *EOS account* của bạn vào mục *account* và điền số định danh\\: *${userId}* của bạn vào mục *telegram\\_id*\\.
            \nĐịa chỉ hợp đồng thông minh\\: [EOSVN Smart Contract](https\\://bloks\\.io\\/account\\/reward\\.eosvn\\?loadContract\\=true\\&tab\\=Actions\\&account\\=reward\\.eosvn\\&scope\\=reward\\.eosvn\\&limit\\=100\\&action\\=unregmember)
        `, { parse_mode: 'MarkdownV2' });
});
bot.command("verify", privateChatOnly, async (ctx: any) => {
    const userId = ctx.from.id;
    const member = await getMember(userId);
    if (!member) {
        await ctx.reply(`Bạn chưa đăng ký thành viên. Hãy sử dụng lệnh /register để đăng ký thành viên.`);
        return;
    }
    const ramBalance = await checkRamBalance(String(member.account));
    const { isPassed, bytes_to_pass } = checkRamRules(ramBalance.totalbytes, member.verified_at.toDate());

    if (!isPassed) {
        await ctx.reply(`Tài khoản của bạn: ${member.account} không đủ RAM để tham gia cộng đồng. Bạn cần thêm ${bytes_to_pass} bytes RAM để tham gia cộng đồng.`);
    } else {
        // Check if user is in the group
        const chatMember = await bot.telegram.getChatMember(EOSVN_BP_CHAT_ID, userId).catch((err: any) => {
            console.log(err)
        });
        if (chatMember) {
            await ctx.reply(`Tài khoản của bạn đủ điều kiện và đã tham gia nhóm rồi.`);
            return;
        }

        // create invite link which is valid for 1 hour and member_limit = 1
        const expire_date = Math.floor(Date.now() / 1000) + 3600;
        const inviteLink = await bot.telegram.createChatInviteLink(EOSVN_BP_CHAT_ID, { name: userId, expire_date, member_limit: 1 });
        await ctx.reply(`Tài khoản của bạn: ${member.account} đã được xác thực. Hãy tham gia vào nhóm qua đường dẫn: 
            \n${inviteLink.invite_link}.`);
        await ctx.reply(`\n*Lưu ý\\: Link chỉ có hiệu lực trong 1 giờ và chỉ cho phép tham gia 1 lần*\\.`, { parse_mode: 'MarkdownV2' });

        // tell rules
        await ctx.reply(`Quy tắc tham gia cộng đồng:
- Mỗi thành viên cần có ít nhất 1MB RAM (1048576 bytes) trong tuần đầu tiên sau khi đăng ký thành viên
- Sau mỗi tuần, mỗi thành viên cần có thêm 1MB RAM (1048576 bytes) so với tuần trước
- Từ tuần thứ 5, mỗi thành viên cần có tổng cộng 5MB RAM (5242880 bytes)
- Nếu không đủ RAM, bạn sẽ bị loại khỏi cộng đồng
- Để tham gia lại, bạn cần có đủ RAM theo quy tắc trên và xác thực lại tài khoản qua lệnh /verify `);
    }

});
bot.command("balance", privateChatOnly, async (ctx: any) => {
    const userId = ctx.from.id;
    const member = await getMember(userId);
    if (!member) {
        await ctx.reply(`Bạn chưa đăng ký thành viên. Hãy sử dụng lệnh /register để đăng ký thành viên.`);
        return;
    }
    const ramBalance = await checkRamBalance(String(member.account));
    await ctx.reply(`Tài khoản: ${member.account}
- RAM: ${ramBalance.ram} bytes
- BRAM: ${ramBalance.bram} bytes
- WRAM: ${ramBalance.wram} bytes
- Deposited to rambank.eos (exSat): ${ramBalance.rambank} bytes
Tổng số RAM: ${ramBalance.totalbytes} bytes`);
    // reply message to tell user how many bytes they need to pass next verification
    const { isPassed, bytes_to_pass } = checkRamRules(ramBalance.totalbytes, member.verified_at.toDate());
    if (!isPassed) {
        await ctx.reply(`Bạn cần có thêm ${bytes_to_pass} bytes RAM để tham gia cộng đồng.`);
    } else {
        // Check if user is in the group
        const chatMember = await bot.telegram.getChatMember(EOSVN_BP_CHAT_ID, userId).catch((err: any) => {
            console.log(err)
        });
        if (!chatMember) {
            await ctx.reply(`Bạn đã đủ RAM để tham gia cộng đồng. Hãy tham gia vào nhóm qua lệnh /verify`);
        }
    }
});

bot.on('message', async (ctx: any) => {
    const userId = ctx.from.id;
    // check user in the group
    if (ctx.update.message.chat.id == EOSVN_BP_CHAT_ID) {
        const member: any = await getMember(userId);
        if (!member) {
            // await bot.telegram.sendMessage(userId, `Tài khoản của bạn chưa được xác thực. Hãy sử dụng lệnh /register để đăng ký thành viên.`).catch((err: any) => {
            //     console.log(err);
            // });
            // await bot.telegram.banChatMember(EOSVN_BP_CHAT_ID, userId, Math.floor(Date.now() / 1000) + 60).catch((err: any) => {
            //     console.log(err)
            // });
            console.log(`User ${userId} is not verified yet`);
        } else {
            const ramBalance = await checkRamBalance(String(member.account));
            const { isPassed, bytes_to_pass } = checkRamRules(ramBalance.totalbytes, member.verified_at.toDate());
            if (!isPassed) {
                // await bot.telegram.sendMessage(userId, `Tài khoản của bạn: ${member.account} không đủ RAM để tham gia cộng đồng. Bạn cần thêm ${bytes_to_pass} bytes RAM để tham gia cộng đồng. Sau đó gọi lệnh /verify để kiểm tra lại.`).catch((err: any) => {
                //     console.log(err)
                // });
                console.log(`User ${userId} does not have enough RAM`);
            }
        }

    }
});

bot.launch();

console.log('Bot is running...');


// cron job every 5 seconds
cron.schedule('* * * * *', async () => {
    console.log('running a task every minute');
    // const { abi } = await contractKit.load(RAMBANK_EOS.CONTRACT_NAME);

    // // save to a json file
    // let file_path = __dirname + '/abi.json';
    // console.log(file_path);
    // let abiData = JSON.stringify(abi, getCircularReplacer());
    // console.log(abiData);
    // let fs = require('fs');
    // fs.writeFile(file_path, abiData, (err: any) => {
    //     if (err) {
    //         throw (err)
    //     }
    //     console.log('Successfully wrote to abi.json');
    // });

    await memberRamManage(bot);
});