module.exports = {
    name: "/f-boat",
    description: "View all and manage your boats",
    execute: async ({ command, ack, client, respond}) => {
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
        const boats = user_data.boats; // should always exist
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["boats-main"]));
        blocks[0].text.text = `${user.username}'s Boats`;
        blocks[1].text.text = `Boat Overview (${1}/${boats.length})`;
        const boat = boats[0];
        const boat_data = DATA.boats[boat.type];
        console.log(boat_data);
        blocks[2].text = `**Boat Type**: \`${boat_data.name}\``;
        blocks[3].text = `**ID**: \`${boat.id}\``;
        blocks[4].text = `**Durability**: \`${boat.durability}%\``;
        blocks[5].text = `**Total Trips**: \`${boat.stats.trips}\``;
        blocks[6].text = `**Total Distance**: \`${boat.stats.distance}\``;
        blocks[7].text = `**Total Fish**: \`${boat.stats.fish}\``;
        blocks[9].text = `**Speed**: \`${boat_data.stats.speed}\``;
        blocks[10].text = `**Capacity**: \`${boat_data.stats.capacity}\``;
        blocks[11].text = `**Sturdiness**: \`${boat_data.stats.sturdiness}\``;
        blocks[12].text = `**Range**: \`${boat_data.stats.range}\``;
        blocks[13].text = `**Tier**: \`${boat_data.tier}\``;
        blocks[14].text = `**Addons**: \`${boat.addons.join(", ")}\``;
        if (boat.default) {
            blocks[16].elements[0].options[0] = {
                text: {
                    type: "plain_text",
                    text: "Unset as Default",
                    emoji: true
                },
                value: "undefault"
            }
        } else {
            blocks[16].elements[0].options[0] = {
                text: {
                    type: "plain_text",
                    text: "Set as Default",
                    emoji: true
                },
                value: "default"
            }
        }
        blocks[17].elements[0].options = boats.map((b, index) => {
            return {
                text: {
                    type: "plain_text",
                    text: `${b.type} (id: ${b.id})`,
                    emoji: true,
                },
                value: String(b.id)
            }
        })
        
        await client.chat.postMessage({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks,
            metadata: {
                event_type: "boats_main",
                event_payload: {
                    userId: user.id,
                    boatId: boat.id
                }
            }
        });

    },
    actions: {
        boat_action_select: async ({action, ack, client, response, body}) => {
            await ack();
            const db = global.db;
            const DATA = global.data;
            const metadata = body.message.metadata.event_payload;
            const boatId = metadata.boatId;
            const userId = metadata.userId;
            const actionValue = action.selected_option.value;
            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
            console.log(boatId, userId, actionValue);
            if (!user) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started.";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }
            const user_data = JSON.parse(user.data);
            const boats = user_data.boats;
            const boat = boats.find(b => b.id === boatId);
            console.log(boat);
            if (!boat) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "It looks like this user doesn't own this boat anymore. ";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks:blocks
                });
                return;
            }

            // just use a confirmation block 
            let blocks2 = JSON.parse(JSON.stringify(DATA.blocks["confirm"]))
            if (actionValue === "default") {
                
            } else if (actionValue === "undefault") {

            } else if (actionValue === "sell") {

            } else if (actionValue === "repair") {

            }


        },
        boat_select: async({ action, ack, client, response, body}) => {
            await ack();
            const db = global.db;
            const DATA = global.data;
            const metadata = body.message.metadata.event_payload;
            const userId = metadata.userId;
            let boat_id = action.selected_option.value;
            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
            if (!user) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started.";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }

            const user_data = JSON.parse(user.data);
            const boats = user_data.boats;
            const boat = boats.find(b => b.id === boat_id);
            if (!boat) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "It looks like this user doesn't own this boat. ";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }
            const boat_data = DATA.boats[boat.type];
            let blocks = JSON.parse(JSON.stringify(DATA.blocks["boats-main"]));
            blocks[0].text.text = `${user.username}'s Boats`;
            blocks[1].text.text = `Boat Overview (${boats.indexOf(boat) + 1}/${boats.length})`;
            blocks[2].text = `**Boat Type**: \`${boat_data.name}\``;
            blocks[3].text = `**ID**: \`${boat.id}\``;
            blocks[4].text = `**Durability**: \`${boat.durability}%\``;
            blocks[5].text = `**Total Trips**: \`${boat.stats.trips}\``;
            blocks[6].text = `**TOtal Distance**: \`${boat.stats.distance}\``;
            blocks[7].text = `**Total Fish**: \`${boat.stats.fish}\``;
            blocks[9].text = `**Speed**: \`${boat_data.stats.speed}\``;
            blocks[10].text = `**Capacity**: \`${boat_data.stats.capacity}\``;
            blocks[11].text = `**Sturdiness**: \`${boat_data.stats.sturdiness}\``;
            blocks[12].text = `**Range**: \`${boat_data.stats.range}\``;
            blocks[13].text = `**Tier**: \`${boat_data.tier}\``;
            blocks[14].text = `**Addons**: \`${boat.addons.join(", ")}\``;
            if (boat.default) {
                blocks[16].elements[0].options[0] = {
                    text: {
                        type: "plain_text",
                        text: "Unset as Default",
                        emoji: true
                    },
                    value: "undefault"
                };
            } else {
                blocks[16].elements[0].options[0] = {
                    text: {
                        type: "plain_text",
                        text: "Set as Default",
                        emoji: true
                    },
                    value: "default"
                };
            }
            blocks[17].elements[0].options = boats.map((b, index) => {
                return {
                    text: {
                        type: "plain_text",
                        text: `${b.type} (id: ${b.id})`,
                        emoji: true
                    },
                    value: String(b.id)
                };
            });
            await client.chat.update({
                channel: body.channel.id,
                ts: body.message.ts,
                blocks: blocks,
                metadata: {
                    event_type: "boats_main",
                    event_payload: {
                        userId: user.id,
                        boatId: boat.id
                    }
                }
            });
        }
    }
}