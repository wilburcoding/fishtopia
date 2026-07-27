module.exports = {
    name: "/f-fish",
    description: "Go fishing!",
    execute: async ({ command, ack, respond, client}) => {
        await ack();
        const DATA = global.data;




        // just testing layout as I go
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-start"]));
        await client.chat.postMessage({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks
        })
    },
    actions: {}
}