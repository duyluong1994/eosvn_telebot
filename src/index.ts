import { Telegraf } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from '../constants';
import { privateChatOnly } from './middlewares';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => {
    ctx.reply(`Nếu bạn có vấn đề gì trong quá trình xác thực thì liên hệ sys admin qua: https://t.me/mr_eosio`);
});

bot.command("verify", privateChatOnly, async (ctx) => {
    const userId = ctx.from.id;
    ctx.reply(`Hãy dùng EOS account có sở hữu 1 trong các loại tài sản sau: RAM, BRAM, WRAM, RAMS hoặc đã gửi cho RAMS DAO thuê để kí giao dịch đăng ký thành viên 'regmember' ở hợp đồng thông minh 'reward.eosvn'. 
        \n Ở phần account: điền vào EOS account của bạn và điền số định danh: ${userId} của bạn vào mục telegram_id.
        \n Địa chỉ hợp đồng thông minh: https://bloks.io/account/reward.eosvn?loadContract=true&tab=Actions&account=reward.eosvn&scope=reward.eosvn&limit=100&action=regmember`)
});


bot.launch();

console.log('Bot is running...');