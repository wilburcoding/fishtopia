module.exports = {
  name: "/f-use",
  description: "Use an item (chest) from your inventory",
  execute: async ({ command, ack, client, respond }) => {
    const db = global.db;
    const DATA = global.data;
    await ack();
    let user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(command.user_id);
    if (!user) {
      const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      blocks[0].text.text =
        "You need to get started before you can use this command. Try using the /f-start command to get started. ";
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blokcs,
      });
      return;
    }

    const user_data = JSON.parse(user.data);
    const inventory = user_data.inventory;
    // console.log(inventory);
    const usable_types = {};
    for (const item of inventory) {
      if (Object.keys(DATA.items).includes(item.type)) {
        const item_data = DATA.items[item.type];
        if (item_data.type === "chest") {
          if (!Object.keys(usable_types).includes(item.type)) {
            usable_types[item.type] = 1;
          } else {
            usable_types[item.type]++;
          }
        }
      }
    }
    let blocks = JSON.parse(JSON.stringify(DATA.blocks["use-select"]));
    blocks[0].text.text = `${user.username} - Use an Item`;
    blocks[1].elements[0].options = [];
    for (const item_type of Object.keys(usable_types)) {
      const item_data = DATA.items[item_type];
      blocks[1].elements[0].options.push({
        text: {
          type: "plain_text",
          text: `${item_data.name} (${item_data.rarity}) - ${usable_types[item_type]}x`,
          emoji: true,
        },
        value: item_type,
      });
    }
    user_data.stats.total_commands_used +=1;
    db.prepare("UPDATE users SET data = ? WHERE id = ?").run(
      JSON.stringify(user_data),
      user.id
    );
    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "use_select",
        event_payload: {
          type: "none",
        },
      },
    });
  },
  actions: {
    use_item_select: async ({ action, ack, client, body }) => {
      await ack();
      const item_type_select = action.selected_option.value;
      // repopulate
      const db = global.db;
      const DATA = global.data;
      let user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(body.user.id);
      if (!user) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "You need to get started before you can use this command. Try using the /f-start command to get started. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      // copy and pasted from execute function

      const user_data = JSON.parse(user.data);
      const inventory = user_data.inventory;
    //   console.log(inventory);
      const usable_types = {};
      for (const item of inventory) {
        if (Object.keys(DATA.items).includes(item.type)) {
          const item_data = DATA.items[item.type];
          if (item_data.type === "chest") {
            if (!Object.keys(usable_types).includes(item.type)) {
              usable_types[item.type] = 1;
            } else {
              usable_types[item.type]++;
            }
          }
        }
      }
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["use-select"]));
      blocks[0].text.text = `${user.username} - Use an Item`;
      blocks[1].elements[0].options = [];
      for (const item_type of Object.keys(usable_types)) {
        const item_data = DATA.items[item_type];
        blocks[1].elements[0].options.push({
          text: {
            type: "plain_text",
            text: `${item_data.name} (${item_data.rarity}) - ${usable_types[item_type]}x`,
            emoji: true,
          },
          value: item_type,
        });
        if (item_type === item_type_select) {
          blocks[1].elements[0].initial_option = {
            text: {
              type: "plain_text",
              text: `${item_data.name} (${item_data.rarity}) - ${usable_types[item_type]}x`,
              emoji: true,
            },
            value: item_type,
          };
        }
      }
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "use_select",
          event_payload: {
            type: item_type_select,
          },
        },
      });
    },
    use_item: async ({ action, ack, client, body }) => {
      await ack();
      const metadata = body.message.metadata.event_payload;
      const item_type = metadata.type;
      const db = global.db;
      const DATA = global.data;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(body.user.id);
      if (!user) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started. ";
        await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks,
        });
        return;
      }

      if (item_type === "none") {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = "You need to select an item to use.";
        await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks
        });
        return;
      }

      const item_data = DATA.items[item_type];
      const inventory = JSON.parse(user.data).inventory;
      let userData = JSON.parse(user.data);
      // make sure user has in their inventory
      const item_index = inventory.findIndex((item) => item.type === item_type);
      if (item_index === -1) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = "You don't have that item in your inventory. ";
        await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks
        });
        return;
      }
      
      // remove item from inventory
      inventory.splice(item_index, 1);
      const money = Math.round((Math.random() * (item_data.loot_table.coins[1] - item_data.loot_table.coins[0])) + item_data.loot_table.coins[0]);
      const bait_prob = item_data.loot_table.bait_prob;
      const tool_prob = item_data.loot_table.tool_prob;
      const nothing_prob = item_data.loot_table.no_item_prob;
      const rand = Math.random();
      let txt = "You used a *" + item_data.name + "* and got: \n\n*" + money + " coins*\n";
      if (rand < bait_prob) {
        // give bait
        let tier = 1;
        if (Object.keys(item_data.loot_table.bait_tier_probs).length == 1) {
            tier = parseInt(Object.keys(item_data.loot_table.bait_tier_probs)[0]);
        } else {
            if (Math.random() < item_data.loot_table.bait_tier_probs[0]) {
                tier = parseInt(Object.keys(item_data.loot_table.bait_tier_probs)[0]);
            } else {
                tier = parseInt(Object.keys(item_data.loot_table.bait_tier_probs)[1]);
            }
        }
        console.log("get bait")
        console.log(tier);
        // pick random bait from that tier
        let baits = [];
        for (const bait of Object.keys(DATA.baits)) {
            if (DATA.baits[bait].tier === tier) {
                baits.push(bait);
            }
        }
        const bait = baits[Math.floor(Math.random() * baits.length)];
        console.log(bait);
        txt += "*" + DATA.baits[bait].name + "*\n";
        userData.equipment.push({
            id: global.generateID(4),
            type: bait,
            durability: 100,
            usage_stats: {
                trips: 0,
                fish_caught: 0,
                fish_weight: 0,
                fish_value: 0
            },
            etype: "bait"
        });

      } else if (rand < bait_prob + tool_prob) {
        // give tool
        let tier = 1;
        if (Object.keys(item_data.loot_table.tool_tier_probs).length == 1) {
            tier = parseInt(Object.keys(item_data.loot_table.tool_tier_probs)[0]);
        } else {
            if (Math.random() < item_data.loot_table.tool_tier_probs[0]) {
                tier = parseInt(Object.keys(item_data.loot_table.tool_tier_probs)[0]);
            } else {
                tier = parseInt(Object.keys(item_data.loot_table.tool_tier_probs)[1]);
            }
        }
        let tools = [];
        for (const tool of Object.keys(DATA.tools)) {
            if (DATA.tools[tool].tier === tier) {
                tools.push(tool);
            }
        }
        const tool = tools[Math.floor(Math.random() * tools.length)];
        console.log(tool);
        txt += "*" + DATA.tools[tool].name + "*\n";
        userData.equipment.push({
            id: global.generateID(4),
            type: tool,
            durability: 100,
            usage_stats: {
                trips: 0,
                fish_caught: 0,
                fish_weight: 0,
                fish_value: 0
            },
            etype: "tool"
        })
        
      } else if (rand < bait_prob + tool_prob + nothing_prob) {
        // give nothing
      }
      const coins = userData.coins + money;
      // remove chest from inventory
      const index = userData.inventory.findIndex((item) => item.type === item_type);
      if (index !== -1) {
        userData.inventory.splice(index, 1);
      }
      db.prepare("UPDATE users SET data = ?, coins = ? WHERE id = ?").run(JSON.stringify(userData), coins, user.id);
      const blocks = [
        {
            type: "card",
            title: {
                type: "plain_text",
                text: "Chest Opened!",
            },
            subtitle: {
                type: "plain_text",
                text: item_data.name + " - " + item_data.rarity + " Chest"
            },
            body: {
                type: "mrkdwn",
                text: txt,
                verbatim: false
            }
        }
      ];

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks
      });
    },
  },
};
