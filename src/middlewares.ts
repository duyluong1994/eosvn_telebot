
// Middleware function to allow only private chats
const privateChatOnly = (ctx: any, next: any) => {
    if (ctx.chat.type === 'private') {
        // Proceed to the next middleware or command handler
        return next();
    } else {
        ctx.reply('Sorry, this command can only be used in private messages.');
    }
};

export { privateChatOnly };
