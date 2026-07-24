module.exports = {
    name: "/f-shop",
    description: "Visit the shop to buy items",
    execute: async ({ command, ack, client, respond }) => {
        const db = global.db;
        const DATA = global.data;
        await ack();

        let user = db.prepare("SELECT * FROM users WHERE id = ?").get(command.user_id);
        if (!user) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started. ";
            await client.chat.postEphemeral({
                channel: command.channel_id,
                user: command.user_id,
                blocks: blocks
            });
            return;
        }

        const user_data = JSON.parse(user.data);
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["shop-main"]));
        

    },
    actions: {}
}