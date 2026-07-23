module.exports = {
  name: "/f-equipment",
  description: "View and manage your equipment",
  execute: async ({ command, ack, respond, client }) => {
    const DATA = global.data;
    const db = global.db;
    await ack();

    let user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(command.user_id);
    if (!user) {
      const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      blocks[0].text.text =
        "You need to get started before you can use this command. Try using /f-start command to get started. ";
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
      return;
    }

    let userData = JSON.parse(user.data);
    let equipment = userData.equipment; // should be an array

    if (equipment.length === 0) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["equipment-main"]));
        blocks[0].text.text = `${user.username}'s Equipment`;
        blocks[1].text.text = `You don't have any equipment yet. Use /f-shop to buy some equipment.`;
        blocks.splice(2, blocks.length - 3); // remove all other blocks. keep refresh button tho
        await client.chat.postMessage({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks,
            metadata: {
                event_type: "equipment_view",
                event_payload: {
                    userId: user.id,
                    toolId: null
                }
            }
        });
        return;
    }
    let item = equipment[0]; // get first item
    console.log(item);
    let itemData = null;
    if (item.etype == "bait") {
      itemData = DATA.baits[item.type];
    } else {
      itemData = DATA.tools[item.type];
    }
    // console.log(itemData);
    let blocks = JSON.parse(JSON.stringify(DATA.blocks["equipment-main"]));
    blocks[0].text.text = `${user.username}'s Equipment`;
    blocks[1].text.text = `Equipment Overview (${equipment.length} items)`;
    blocks[2].text = `**Equipment Type**: \`${itemData.name} (${item.etype})\``;
    blocks[3].text = `**ID**: \`${item.id}\``;
    blocks[4].text = `**Description**: \`${itemData.description}\``;
    blocks[5].text = `**Cost**: \`${itemData.cost} coins\``;
    blocks[6].text = `**Level Requirement**: \`${itemData.level}\``;
    blocks[7].text = `**Tier**: \`${itemData.tier}\``;
    blocks[8].text = `**Durability**: \`${item.durability}\``;
    const bait_effect_templates = {
      catch_speed: " in catch speed",
      catch_nothing: " in chance of catching nothing",
      xp_multiplier: " in XP earned",
      catch_count: " in catch count range",
      weight_multiplier: " in weight of fish caught",
      common_multiplier: " in chance of catching common fish",
      uncommon_multiplier: " in chance of catching uncommon fish",
      rare_multiplier: " in chance of catching rare fish",
      epic_multiplier: " in chance of catching epic fish",
      legendary_multiplier: " in chance of catching legendary fish",
      shiny_multiplier: " in chance of catching shiny fish",
      chroma_multiplier: " in chance of catching chroma fish",
      item_multiplier: " in chance of catching any item",
    };
    let effects = "";
    for (const [effect, value] of Object.entries(itemData.effects)) {
      if (item.etype == "bait") {
        if (typeof value === "number") {
          if (value < 0) {
            effects += `\`Decrease ${bait_effect_templates[effect]} by ${Math.floor(Math.abs(value) * 100)}%\`\n`;
          } else {
            effects += `\`Increase ${bait_effect_templates[effect]} by ${Math.floor(value * 100)}%\`\n`;
          }
        } else {
          // has to be an array
          effects += `\`Increase ${bait_effect_templates[effect]} by ${value[0]} to ${value[1]}\`\n`;
        }
      } else {
        // tool effects -> TBD
      }
    }
    if (effects === "") {
      effects = "\`No effects\`";
    }
    blocks[9].text = `**Effects**: ` + effects;
    blocks[11].text = `**Total Trips**: \`${item.usage_stats.trips}\``;
    blocks[12].text = `**Total Fish Caught**: \`${item.usage_stats.fish_caught}\``;
    blocks[13].text = `**Total Fish Weight**: \`${item.usage_stats.fish_weight}\``;
    blocks[14].text = `**Total Fish Value**: \`${item.usage_stats.fish_value}\``;

    blocks[17].elements[0].options = equipment.map((item) => {
      if (item.etype == "bait") {
        return {
          text: {
            type: "plain_text",
            text: `${DATA.baits[item.type].name} (ID: ${item.id})`,
            emoji: true,
          },
          value: item.etype + "-" + item.id,
        };
      }
      // otherwise tool
      return {
        text: {
          type: "plain_text",
          text: `${DATA.tools[item.type].name} (ID: ${item.id})`,
          emoji: true,
        },
        value: item.etype + "-" + item.id,
      };
    });

    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "equipment_view",
        event_payload: {
          userId: user.id,
          toolId: item.id,
          toolType: item.etype,
        },
      },
    });
  },
  actions: {
    equipment_select: async ({ action, ack, client, body, respond }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const toolId = action.selected_option.value.split("-")[1];
      const toolType = action.selected_option.value.split("-")[0];
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "You need to get started before you can use this command. Try using the /f-start command to get started.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      let userData = JSON.parse(user.data);
      let equipment = userData.equipment;
      let item = equipment.find(
        (item) => item.id === toolId && item.etype === toolType,
      );
      if (!item) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "The selected equipment item was not found in your inventory.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      let itemData = null;
      if (item.etype == "bait") {
        itemData = DATA.baits[item.type];
      } else {
        itemData = DATA.tools[item.type];
      }
      
      console.log(itemData);
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["equipment-main"]));
      blocks[0].text.text = `${user.username}'s Equipment`;
      blocks[1].text.text = `Equipment Overview (${equipment.length} items)`;
      blocks[2].text = `**Equipment Type**: \`${itemData.name} (${item.etype})\``;
      blocks[3].text = `**ID**: \`${item.id}\``;
      blocks[4].text = `**Description**: \`${itemData.description}\``;
      blocks[5].text = `**Cost**: \`${itemData.cost} coins\``;
      blocks[6].text = `**Level Requirement**: \`${itemData.level}\``;
      blocks[7].text = `**Tier**: \`${itemData.tier}\``;
      blocks[8].text = `**Durability**: \`${item.durability}\``;

      const bait_effect_templates = {
        catch_speed: " in catch speed",
        catch_nothing: " in chance of catching nothing",
        xp_multiplier: " in XP earned",
        catch_count: " in catch count range",
        weight_multiplier: " in weight of fish caught",
        common_multiplier: " in chance of catching common fish",
        uncommon_multiplier: " in chance of catching uncommon fish",
        rare_multiplier: " in chance of catching rare fish",
        epic_multiplier: " in chance of catching epic fish",
        legendary_multiplier: " in chance of catching legendary fish",
        shiny_multiplier: " in chance of catching shiny fish",
        chroma_multiplier: " in chance of catching chroma fish",
        item_multiplier: " in chance of catching any item",
      };
      let effects = "";
      for (const [effect, value] of Object.entries(itemData.effects)) {
        if (item.etype == "bait") {
          if (typeof value === "number") {
            if (value < 0) {
              effects += `\`Decrease ${bait_effect_templates[effect]} by ${Math.floor(Math.abs(value) * 100)}%\`\n`;
            } else {
              effects += `\`Increase ${bait_effect_templates[effect]} by ${Math.floor(value * 100)}%\`\n`;
            }
          } else {
            // array
            effects += `\`Increase ${bait_effect_templtaes[effect]} by ${value[0]} to ${value[1]}\`\n`;
          }
        } else {
          // tool effects are TBD
        }
      }
      if (effects === "") {
        effects = "\`No effects\`";
      }

      blocks[9].text = `**Effects**: ` + effects;
      blocks[11].text = `**Total Trips**: \`${item.usage_stats.trips}\``;
      blocks[12].text = `**Total Fish Caught**: \`${item.usage_stats.fish_caught}\``;
      blocks[13].text = `**Total Fish Weight**: \`${item.usage_stats.fish_weight}\``;
      blocks[14].text = `**Total Fish Value**: \`${item.usage_stats.fish_value}\``;
      blocks[17].elements[0].options = equipment.map((item) => {
        if (item.etype == "bait") {
          return {
            text: {
              type: "plain_text",
              text: `${DATA.baits[item.type].name} (ID: ${item.id})`,
              emoji: true,
            },
            value: item.etype + "-" + item.id,
          };
        } else {
          return {
            text: {
              type: "plain_text",
              text: `${DATA.tools[item.type].name} (ID: ${item.id})`,
              emoji: true,
            },
            value: item.etype + "-" + item.id,
          };
        }
      });

      await client.chat.update({
        channel: body.channel.id,
        user: body.user.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "equipment_view",
          event_payload: {
            userId: user.id,
            toolId: item.id,
            toolType: item.etype,
          },
        },
      });
    },
    equipment_action_select: async ({ action, ack, client, body, respond }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const toolId = metadata.event_payload.toolId;
      const toolType = metadata.event_payload.toolType;
      const actionValue = action.selected_option.value;

      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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

      // the usual checks and what not
      let userData = JSON.parse(user.data);
      let equipment = userData.equipment;
      console.log(equipment);
      console.log(toolId, toolType);
      let item = equipment.find(
        (item) => item.id === toolId && item.etype === toolType,
      );
      if (!item) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = `It looks like user doesn't own this item anymore. `;
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      let itemData = null;
      if (item.etype == "bait") {
        itemData = DATA.baits[item.type];
      } else {
        itemData = DATA.tools[item.type];
      }
      // show confirmation for action
      let blocks2 = JSON.parse(JSON.stringify(DATA.blocks["confirm"]));
      if (actionValue === "sell") {
        const sellPrice = Math.floor(
          itemData.cost * 0.7 * (item.durability / 100),
        ); // same as boat
        blocks2[0].body.text = `Are you sure you want to sell this item for ${sellPrice} coins? This action cannot be undone.`;
      } else if (actionValue === "repair") {
        const repairCost = Math.floor(itemData.cost * 0.08); // same as boat
        blocks2[0].body.text = `Are you sure you want to repair this item for ${repairCost} coins? This will increase its durability by 25%.`;
        if (user.coins < repairCost) {
          const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
          blocks2[0].body.text += `You don't have enough coins to repair this item. You need at least ${repairCost} coins to repair this item. `;
        }
      }
      blocks2[0].actions[0].action_id = "equipment_action_confirm";
      blocks2[0].actions[1].action_id = "equipment_action_cancel";
      await client.chat.postMessage({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks2,
        metadata: {
          event_type: "equipment_action_confirm",
          event_payload: {
            userId: user.id,
            toolId: item.id,
            toolType: item.etype,
            actionType: actionValue,
          },
        },
      });
    },
    equipment_action_confirm: async ({
      action,
      ack,
      client,
      body,
      respond,
    }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const toolId = metadata.event_payload.toolId;
      const actionType = metadata.event_payload.actionType;
      const toolType = metadata.event_payload.toolType;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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

      let userData = JSON.parse(user.data);
      let equipment = userData.equipment;
      console.log(equipment);
      // make sure item exists
      const item = equipment.find(
        (item) => item.id === toolId && item.etype === toolType,
      );
      if (!item) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = `It looks like this user doesn't own this item anymore. `;
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      let itemData = null;
      if (item.etype == "bait") {
        itemData = DATA.baits[item.type];
      } else {
        itemData = DATA.tools[item.type];
      }

      const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      if (actionType === "sell") {
        const sellPrice = Math.floor(
          itemData.cost * 0.7 * (item.durability / 100),
        );
        equipment = equipment.filter(
          (item) => !(item.id === toolId && item.etype === toolType),
        );
        userData.equipment = equipment;
        user.coins += sellPrice;
        blocks[0].text.text = `You have successfully sold this item for ${sellPrice} coins.`;
      } else if (actionType === "repair") {
        const repairCost = Math.floor(itemData.cost * 0.08);
        if (user.coins < repairCost) {
          blocks[0].text.text = `You don't have enough coins to repair this item. You need at least ${repairCost} coins to repair this item. `;
        } else {
          item.durability = Math.min(item.durability + 25, 100); // fun little max trick
          user.coins -= repairCost;
          userData.equipment = equipment;
          blocks[0].text.text = `You have successfully repaired this item for ${repairCost} coins. Its durability is now ${item.durability}.`;
        }
      }
      await db
        .prepare("UPDATE users SET data = ?, coins = ? WHERE id = ?")
        .run(JSON.stringify(userData), user.coins, userId);
      await client.chat.update({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks,
        ts: body.message.ts,
      });
    },
    refresh_equipment: async ({ action, ack, client, body, respond }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const toolId = metadata.event_payload.toolId;
      const toolType = metadata.event_payload.toolType;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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

      let userData = JSON.parse(user.data);
      let equipment = userData.equipment;
      if (equipment.length === 0) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["equipment-main"]));
        blocks[0].text.text = `${user.username}'s Equipment`;
        blocks[1].text.text = `You don't have any equipment yet. Use /f-shop to buy some equipment.`;
        blocks.splice(2, blocks.length - 3); // remove all other blocks but keep the refresh button
        await client.chat.update({
            channel: body.channel.id,
            user: body.user.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
                event_type: "equipment_view",
                event_payload: {
                    userId: user.id,
                    toolId: null
                }
            }
        });
        return;
      }
      let item = equipment.find(
        (item) => item.id === toolId && item.etype === toolType,
      );
      if (!item) {
        item = equipment[0]; // fallback to first item if it was removed or somethign
      }
      


      let itemData = null;
      if (item.etype == "bait") {
        itemData = DATA.baits[item.type];
      } else {
        itemData = DATA.tools[item.type];
      }
      // console.log(itemData);
      


      // everything else should be the same -> copied from equipment_select aciton
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["equipment-main"]));
      blocks[0].text.text = `${user.username}'s Equipment`;
      blocks[1].text.text = `Equipment Overview (${equipment.length} items)`;
      blocks[2].text = `**Equipment Type**: \`${itemData.name} (${item.etype})\``;
      blocks[3].text = `**ID**: \`${item.id}\``;
      blocks[4].text = `**Description**: \`${itemData.description}\``;
      blocks[5].text = `**Cost**: \`${itemData.cost} coins\``;
      blocks[6].text = `**Level Requirement**: \`${itemData.level}\``;
      blocks[7].text = `**Tier**: \`${itemData.tier}\``;
      blocks[8].text = `**Durability**: \`${item.durability}\``;
      const bait_effect_templates = {
        catch_speed: " in catch speed",
        catch_nothing: " in chance of catching nothing",
        xp_multiplier: " in XP earned",
        catch_count: " in catch count range",
        weight_multiplier: " in weight of fish caught",
        common_multiplier: " in chance of catching common fish",
        uncommon_multiplier: " in chance of catching uncommon fish",
        rare_multiplier: " in chance of catching rare fish",
        epic_multiplier: " in chance of catching epic fish",
        legendary_multiplier: " in chance of catching legendary fish",
        shiny_multiplier: " in chance of catching shiny fish",
        chroma_multiplier: " in chance of catching chroma fish",
        item_multiplier: " in chance of catching any item",
      };
      let effects = "";
      for (const [effect, value] of Object.entries(itemData.effects)) {
        if (item.etype == "bait") {
          if (typeof value === "number") {
            if (value < 0) {
              effects += `\`Decrease ${bait_effect_templates[effect]} by ${Math.floor(Math.abs(value) * 100)}%\`\n`;
            } else {
              effects += `\`Increase ${bait_effect_templates[effect]} by ${Math.floor(value * 100)}%\`\n`;
            }
          } else {
            // has to be an array
            effects += `\`Increase ${bait_effect_templates[effect]} by ${value[0]} to ${value[1]}\`\n`;
          }
        } else {
          // tool effects -> TBD
        }
      }
      if (effects === "") {
        effects = "\`No effects\`";
      }
      blocks[9].text = `**Effects**: ` + effects;
      blocks[11].text = `**Total Trips**: \`${item.usage_stats.trips}\``;
      blocks[12].text = `**Total Fish Caught**: \`${item.usage_stats.fish_caught}\``;
      blocks[13].text = `**Total Fish Weight**: \`${item.usage_stats.fish_weight}\``;
      blocks[14].text = `**Total Fish Value**: \`${item.usage_stats.fish_value}\``;

      blocks[17].elements[0].options = equipment.map((item) => {
        if (item.etype == "bait") {
          return {
            text: {
              type: "plain_text",
              text: `${DATA.baits[item.type].name} (ID: ${item.id})`,
              emoji: true,
            },
            value: item.etype + "-" + item.id,
          };
        }
        // otherwise tool
        return {
          text: {
            type: "plain_text",
            text: `${DATA.tools[item.type].name} (ID: ${item.id})`,
            emoji: true,
          },
          value: item.etype + "-" + item.id,
        };
      });

      await client.chat.postMessage({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks,
        metadata: {
          event_type: "equipment_view",
          event_payload: {
            userId: user.id,
            toolId: item.id,
            toolType: item.etype,
          },
        },
      });
    },
  },
};
