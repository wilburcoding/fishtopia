function populateStartBlocks(DATA, user, toolId, baitId, boatId, mapId) {
    let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-start"]));
    const userData = JSON.parse(user.data);
    let userEquipment = userData.equipment; 
    let tool = userEquipment.find(item => item.id === toolId && item.etype === "tool");
    let bait = userEquipment.find(item => item.id === baitId && item.etype === "bait");
    let boat = userData.boats.find(item => item.id === boatId);
    blocks[0].text.text = `${user.username} - Preparing to Fish`
    // populate block with the selected stuff
    const boatData = DATA.boats[boat.type]
    blocks[2].elements[0].title.text = boatData.name;
    blocks[2].elements[0].subtitle.text = `Default Boat - ID: ${boat.id}`;
    blocks[2].elements[0].body.text = `
    ${boatData.description}
*Tier*: \`${boatData.tier}\`
*Speed*: \`${boatData.stats.speed}\`
*Sturdiness*: \`${boatData.stats.sturdiness}\`,
*Capacity*: \`${boatData.stats.capacity}\`
*Range*: \`${boatData.stats.range}\`
    `

    const toolData = DATA.tools[tool.type];
    blocks[2].elements[1].title.text = toolData.name;
    blocks[2].elements[1].subtitle.text = `Selected Tool - ID: ${tool.id}`;
    blocks[2].elements[1].body.text = `
    ${toolData.description}
*Tier*: \`${toolData.tier}\`
*Durability*: \`${tool.durability}%\`
*Effects*: \`${Object.keys(toolData.effects).length}\`
    `

    const baitData = DATA.baits[bait.type];
    blocks[2].elements[2].title.text = baitData.name;
    blocks[2].elements[2].subtitle.text = `Selected Bait - ID: ${bait.id}`;
    blocks[2].elements[2].body.text = `
    ${baitData.description}
*Tier*: \`${baitData.tier}\`
*Durability*: \`${bait.durability}%\`
*Effects*: \`${Object.keys(baitData.effects).length}\`
    `

    // populate static select lists 
    const tools = userEquipment.filter(item => item.etype === "tool");
    blocks[3].element.options = tools.map(item => {
        return {
            "text": {
                "type": "plain_text",
                "text": `${DATA.tools[item.type].name} - (id: ${item.id})`,
                "emoji": true
            },
            "value": item.id
        };
    });
    blocks[3].element.initial_option = {
        text: {
            type: "plain_text",
            text: `${DATA.tools[tool.type].name} - (id: ${tool.id})`,
            emoji: true
        },
        value: tool.id
    }

    const baits = userEquipment.filter(item => item.etype === "bait");
    blocks[4].element.options = baits.map(item => {
        return {
            "text": {
                "type": "plain_text",
                "text": `${DATA.baits[item.type].name} - (id: ${item.id})`,
                "emoji": true
            },
            "value": item.id
        }
    });
    blocks[4].element.initial_option = {
        text: {
            type: "plain_text",
            text: `${DATA.baits[bait.type].name} - (id: ${bait.id})`,
            emoji: true
        },
        value: bait.id
    }
    // maps
    blocks[6].element.options = Object.keys(DATA.maps).map(map => {
        return {
            "text": {
                "type": "plain_text",
                "text": `${DATA.maps[map].name}`,
                "emoji": true
            },
            "value": map
        }
    });
    blocks[6].element.initial_option = {
        text: {
            type: "plain_text",
            text: `${DATA.maps[mapId].name}`,
            emoji: true
        },
        value: mapId
    }

    // map card
    const mapData = DATA.maps[mapId];
    blocks[7].title.text = mapData.name;
    let fish_available = 0;
    for (let fish of Object.keys(DATA.fish)) {
        if (Object.keys(DATA.fish[fish]["maps"]).includes(mapId)) {4
            fish_available++;
        }
    }
    // fish_available = fish_available.trim();
    blocks[7].body.text = `
${mapData.description}
*Danger* (Sturdiness recommended): \`${mapData.danger}\`
*Distance*: \`${mapData.distance}\`
*Fish Available*: ${fish_available}
    `
    return blocks;

    
}


module.exports = {
    name: "/f-fish",
    description: "Go fishing!",
    execute: async ({ command, ack, respond, client}) => {
        await ack();
        const DATA = global.data;
        const db = global.db;

        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(command.user_id);
        if (!user) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = "You need to get started before you can use this command. Try using /f-start command to get started. ";
            await client.chat.postEphemeral({
                channel: command.channel_id,
                user: command.user_id,
                blocks: blocks
            });
            return;
        }

        let userData = JSON.parse(user.data);
        let equipment = userData.equipment;
        let toolId = null;
        let baitId = null;
        let boatId = null;
        let mapId = null;

        // automatically select the best tool and bait
        let tools = equipment.filter(item => item.etype === "tool");
        tools.sort((a, b) => b.tier - a.tier);
        if (tools.length > 0) {
            toolId = tools[0].id;
        }

        let baits = equipment.filter(item => item.etype === "bait");
        baits.sort((a, b) => b.tier - a.tier);
        if (baits.length > 0) {
            baitId = baits[0].id;
        }

        let boats = userData.boats;
        // find default boat -> should always exist
        let defaultBoat = boats.find((boat) => boat.default);
        if (defaultBoat) {
            boatId = defaultBoat.id;
        }

        // find best map boat can go to (based on sturdiness)
        for (let map of Object.keys(DATA.maps)) {
            // console.log(map);
            // console.log(DATA.maps[map].danger);
            // console.log(DATA.boats[defaultBoat.type].stats.sturdiness);
            if (DATA.maps[map].danger <= DATA.boats[defaultBoat.type].stats.sturdiness) {
                console.log(map);
                mapId = map;
            }
        }
        console.log(mapId);

        // console.log(toolId);
        // console.log(baitId);
        // console.log(boatId);
        const blocks = populateStartBlocks(DATA, user, toolId, baitId, boatId, mapId);

        // just testing layout as I go
            // const blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-start"]));
        
        
        await client.chat.postMessage({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks,
            metadata: {
                event_type: "fish_start",
                event_payload: {
                    toolId: toolId,
                    baitId: baitId,
                    boatId: boatId,
                    userId: user.id
                }
            }
        })
    },
    actions: {
        pregame_tool_select: async ({ action, ack, client, body, respond }) => {
            await ack();
            const new_tool_id = action.selected_option.value;
            const metadata = body.message.metadata;
            const baitId = metadata.event_payload.baitId;
            const boatId = metadata.event_payload.boatId;
            const userId = metadata.event_payload.userId;
            const DATA = global.data;
            const db = global.db;

            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
            if (!user) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started. ";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }

            const blocks = populateStartBlocks(DATA, user, new_tool_id, baitId, boatId);
            await client.chat.update({
                channel: body.channel.id,
                ts: body.message.ts,
                user: body.user.id,
                blocks: blocks,
                metadata: {
                    event_type: "fish_start",
                    event_payload: {
                        userId: user.id,
                        toolId: new_tool_id,
                        baitId: baitId,
                        boatId: boatId
                    }
                }
            });

             
        },
        pregame_bait_select: async ({ action, ack, client, body, respond}) => {
            await ack();
            const new_bait_id = action.selected_option.value;
            const metadata = body.message.metadata;
            const toolId = metadata.event_payload.toolId;
            const boatId = metadata.event_payload.boatId;
            const userId = metadata.event_payload.userId;
            const DATA = global.data;
            const db = global.db;
            
            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
            if (!user) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text="You need to get started before you can use this command. Try using the /f-start command to get started. ";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }

            const blocks = populateStartBlocks(DATA, user, toolId, new_bait_id, boatId);
            await client.chat.update({
                channel: body.channel.id,
                ts: body.message.ts,
                user: body.user.id,
                blocks: blocks,
                metadata: {
                    event_type: "fish_start",
                    event_payload: {
                        userId: user.id,
                        toolId: toolId,
                        baitId: new_bait_id,
                        boatId: boatId
                    }
                }
            });

        },
        pregame_location_select: async ({ action, ack, client, body, respond }) => {
            await ack();
            const new_map_id = action.selected_option.value;
            const metadata = body.message.metadata;
            const toolId = metadata.event_payload.toolId;
            const baitId = metadata.event_payload.baitId;
            const boatId = metadata.event_payload.boatId;

            const userId = metadata.event_payload.userId;
            const DATA = global.data;
            const db = global.db;

            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
            if (!user) {
                const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
                blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started. ";
                await client.chat.postEphemeral({
                    channel: body.channel.id,
                    user: body.user.id,
                    blocks: blocks
                });
                return;
            }
            
            const blocks = populateStartBlocks(DATA, user, toolId, baitId, boatId, new_map_id);
            await client.chat.update({
                channel: body.channel.id,
                ts: body.message.ts,
                user: body.user.id,
                blocks: blocks,
                metadata: {
                    event_type: "fish_start",
                    event_payload: {
                        userId: user.id,
                        toolId: toolId,
                        baitId: baitId,
                        boatId: boatId,
                        mapId: new_map_id
                    }
                }
            });
            
        }

    }
}