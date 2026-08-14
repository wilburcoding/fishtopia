module.exports = {
    name: "/f-inventory",
    description: "View your inventory",
    execute: async ({ command, ack, respond, client}) => {
        const DATA = global.data;
        await ack();
        const db = global.db;


        const blocks = JSON.parse(JSON.stringify(DATA.blocks["inventory"]));
        await client.chat.postMessage({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks,
        });
        // metadata for this command would probably just be the different options the user supplies
    
    },
    actions: {}
}