module.exports = {
    name: "/f-profile",
    description: "View your profile or find another player's profile",
    execute: async ({ command, ack, client, respond }) => {
        const db = global.db;
        const DATA = global.data;
        await ack();
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(command.user_id);
        if (!user) {
            const blocks = DATA.blocks["error"];
            blocks[0].text.text = "You need to get started before you can use this command.";
            await client.chat.postEphemeral({
                channel: command.channel_id,
                user: command.user_id,
                blocks: blocks
            });
        }
        // View profile
        console.log(command);
        const text = command.text; // check if user ID was provided
        if (text.startsWith('<@')) {

        }
    },
    actions: []
}