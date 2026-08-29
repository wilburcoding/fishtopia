module.exports = {
  name: "/f-profile",
  description: "View your profile or find another player's profile",
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
        blocks: blocks,
      });
      return;
    }
    // View profile
    const text = command.text; // check if user ID was provided
    if (text.startsWith("<@")) {
      const userId = text.match(/<@(\w+)>/)[1];
      const targetUser = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId);
      if (!targetUser) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like that user doesn't exist in our database.";
        await client.chat.postEphemeral({
          channel: command.channel_id,
          user: command.user_id,
          blocks: blocks,
        });
        return;
      }
      user = targetUser;
    }
    // display user profile
    // console.log(user);
    let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-overview"]));
    const created_date = new Date(user.created_at);
    const created_str = `${created_date.getFullYear()}-${(created_date.getMonth() + 1).toString().padStart(2, "0")}-${created_date.getDate().toString().padStart(2, "0")}`;
    blocks[0].text.text = `${user.username}'s Profile - Overview`;
    blocks[1].text = `**Slack ID**: \`${user.id}\``;
    blocks[2].text = `**Coins Balance**: \`${user.coins}\``;
    blocks[3].text = `**Gold Balance**: \`${user.gold}\``;
    blocks[4].text = `**Level**: \`${user.level}\ (${user.xp}/${DATA.levels[user.level.toString()]})\``;
    blocks[5].text = `**Account Created**: \`${created_str}\``;

    let userData = JSON.parse(user.data);
    userData.stats.total_commands_used += 1;
    db.prepare("UPDATE users SET data = ? WHERE id = ?").run(
      JSON.stringify(userData),
      user.id
    );
    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "profile_view",
        event_payload: {
          userId: user.id,
        },
      },
    });
  },
  actions: {
    profile_page_select: async ({ action, ack, client, respond, body }) => {
      await ack();
      let DATA = global.data;
      const selected = action.selected_option.value;
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like that user doesn't exist in our database anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
      }

      if (selected === "overview") {
        let blocks = JSON.parse(
          JSON.stringify(DATA.blocks["profile-overview"]),
        );
        const created_date = new Date(user.created_at);
        const created_str = `${created_date.getFullYear()}-${(created_date.getMonth() + 1).toString().padStart(2, "0")}-${created_date.getDate().toString().padStart(2, "0")}`;
        blocks[0].text.text = `${user.username}'s Profile - Overview`;
        blocks[1].text = `**Slack ID**: \`${user.id}\``;
        blocks[2].text = `**Coins Balance**: \`${user.coins}\``;
        blocks[3].text = `**Gold Balance**: \`${user.gold}\``;
        blocks[4].text = `**Level**: \`${user.level}\ (${user.xp}/${DATA.levels[user.level.toString()]})\``;
        blocks[5].text = `**Account Created**: \`${created_str}\``;
        await client.chat.postMessage({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
            },
          },
        });
      } else if (selected === "completion") {
        let blocks = JSON.parse(
          JSON.stringify(DATA.blocks["profile-completion"]),
        );
        blocks[0].text.text = `${user.username}'s Profile - Completion`;
        const userData = JSON.parse(user.data);
        const completion = userData.completion;
        let totalCount = 0;
        let totalCompleted = 0;

        for (const map of Object.keys(completion)) {
          let count = 0;
          let total = Object.keys(completion[map]).length;
          for (const item of Object.keys(completion[map])) {
            if (completion[map][item]) {
              count++;
            }
          }
          const mapName = DATA.maps[map].name;
          blocks.splice(1, 0, {
            type: "markdown",
            text: `${mapName}: \`${count}/${total} (${((count / total) * 100).toFixed(2)}%)\``,
          });
          totalCount += total;
          totalCompleted += count;
        }
        blocks.splice(1, 0, {
          type: "markdown",
          text: `**Total**: \`${totalCompleted}/${totalCount} (${((totalCompleted / totalCount) * 100).toFixed(2)}%)\``,
        });

        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
            },
          },
        });
      } else if (selected === "boats") {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-boats"]));
        let userData = JSON.parse(user.data);
        let boats = userData.boats;
        blocks[0].text.text = `${user.username}'s Profile - Boats`;
        const boat = boats[0];
        blocks[1].elements[0].options = boats.map((b) => {
          return {
            text: {
              type: "plain_text",
              text: `${DATA.boats[b.type].name} (id: ${b.id})`,
              emoji: true,
            },
            value: b.id,
          };
        });
        blocks[3].text = `**Boat Type**: \`${DATA.boats[boat.type].name}\``;
        blocks[4].text = `**ID**: \`${boat.id}\``;
        blocks[5].text = `**Durability**: \`${boat.durability}%\``;
        blocks[6].text = `**Total Trips**: \`${boat.stats.trips}\``;
        blocks[7].text = `**Total Distance**: \`${boat.stats.distance}\``;
        blocks[8].text = `**Total Fish**: \`${boat.stats.fish}\``;
        // blocks[9].text = "**Addons**: `" + boat.addons.join(", ") + "`";
        // attributes
        const attributes = DATA.boats[boat.type].stats;
        blocks[10].text = "**Speed**: `" + attributes.speed + " kt`";
        blocks[11].text = "**Capacity**: `" + attributes.capacity + " slots`";
        blocks[12].text = "**Sturdiness**: `" + attributes.sturdiness + "/20`";
        blocks[13].text =
          "**Range**: `" + attributes.range + " nautical miles`";
        blocks[14].text =
          "**Tier**: `" + DATA.tiers[DATA.boats[boat.type].tier - 1] + "`";
        blocks[15].text = "**Addons**: `" + boat.addons.join(", ") + "`";

        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedBoat: boats[0].id,
            },
          },
        });
      } else if (selected === "tools") {
        let blocks = JSON.parse(
          JSON.stringify(DATA.blocks["profile-equipment"]),
        );
        let userData = JSON.parse(user.data);
        const tools = userData.equipment.filter(
          (item) => item.etype === "tool",
        );
        console.log(tools);
        if (tools.length == 0) {
          blocks.splice(4, 11);
          blocks[1].elements[0].options[0].text.text = "No tools available";
          blocks[3].text =
            "This user doesn't have any tools in their inventory. When they buy or recieve tools, they will show up here. ";
          await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
              event_type: "profile_view",
              event_payload: {
                userId: user.id,
                selectedOption: "tools",
              },
            },
          });
          return;
        }
        blocks[1].elements[0].options = tools.map((tool) => {
          return {
            text: {
              type: "plain_text",
              text: DATA.tools[tool.type].name + " (id: " + tool.id + ")",
              emoji: true,
            },
            value: tool.id,
          };
        });
        const tool_data = DATA.tools[tools[0].type];
        blocks[0].text.text = `${user.username}'s Profile - Tools`;
        blocks[3].text = `**Tool Type**: \`${tool_data.name}\``;
        blocks[4].text = `**ID**: \`${tools[0].id}\``;
        blocks[5].text = `**Description**: \`${tool_data.description}\``;
        blocks[6].text = `**Cost**: \`${tool_data.cost} coins\``;
        blocks[7].text = `**Level Requirement**: \`${tool_data.level}\``;
        blocks[8].text = `**Tier**: \`${tool_data.tier}\``;
        blocks[9].text = `**Durability**: \`${tools[0].durability}%\``;
        blocks[10].text = "**Effects**: \n`TBD`"; // tbd
        blocks[12].text = `**Total Trips**: \`${tools[0].usage_stats.trips}\``;
        blocks[13].text = `**Total Fish**: \`${tools[0].usage_stats.fish_caught}\``;
        blocks[14].text = `**Total Weight of Fish**: \`${tools[0].usage_stats.fish_weight}\``;
        blocks[15].text = `**Total Value of Fish**: \`${tools[0].usage_stats.fish_value}\``;
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedOption: "tools",
            },
          },
        });
      } else if (selected === "baits") {
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
        let blocks = JSON.parse(
          JSON.stringify(DATA.blocks["profile-equipment"]),
        );
        // update each blocks to show baits instead of tools
        let userData = JSON.parse(user.data);
        const baits = userData.equipment.filter(
          (item) => item.etype === "bait",
        );
        blocks[0].text.text = `${user.username}'s Profile - Baits`;
        blocks[2].text.text = "Baits Overview";
        blocks[1].elements[0].placeholder.text = "Select a bait";
        blocks[1].elements[0].action_id = "profile_bait_select";
        blocks[1].elements[0].options = baits.map((bait) => {
          return {
            text: {
              type: "plain_text",
              text: DATA.baits[bait.type].name + " (id: " + bait.id + ")",
              emoji: true,
            },
            value: bait.id,
          };
        });

        if (baits.length === 0) {
          blocks.splice(4, 11);
          console.log(blocks);
          blocks[1].elements[0].options[0].text.text = "No baits available";
          blocks[3].text =
            "This user doesn't have any baits in their inventory. When they buy or recieve baits, they will show up here. ";
          await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
          });
          return;
        }

        const bait_data = DATA.baits[baits[0].type];
        let effects_txt = "";
        for (const effect of Object.keys(bait_data.effects)) {
          if (typeof bait_data.effects[effect] === "number") {
            if (bait_data.effects[effect] > 0) {
              effects_txt += `\`Increase ${bait_effect_templates[effect]} by ${bait_data.effects[effect] * 100}%\`\n`;
            } else {
              effects_txt += `\`Decrease ${bait_effect_templates[effect]} by ${Math.abs(bait_data.effects[effect] * 100)}%\`\n`;
            }
          } else {
            // has to be like an array (like a range)
            effects_txt += `\`Increase ${bait_effect_templates[effect]} by ${bait_data.effects[effect][0]} to ${bait_data.effects[effect][1]}\`\n`;
          }
        }

        blocks[3].text = `**Bait Type**: \`${bait_data.name}\``;
        blocks[4].text = `**ID**: \`${baits[0].id}\``;
        blocks[5].text = `**Description**: \`${bait_data.description}\``;
        blocks[6].text = `**Cost**: \`${bait_data.cost} coins\``;
        blocks[7].text = `**Level Requirement**: \`${bait_data.level}\``;
        blocks[8].text = `**Tier**: \`${bait_data.tier}\``;
        blocks[9].text = `**Durability**: \`${baits[0].durability}%\``;
        blocks[10].text = `**Effects**: \n` + effects_txt;
        blocks[12].text = `**Total Trips**: \`${baits[0].usage_stats.trips}\``;
        blocks[13].text = `**Total Fish**: \`${baits[0].usage_stats.fish_caught}\``;
        blocks[14].text = `**Total Weight of Fish**: \`${baits[0].usage_stats.fish_weight}\``;
        blocks[15].text = `**Total Value of Fish**: \`${baits[0].usage_stats.fish_value}\``;

        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedOption: "baits",
            },
          },
        });
      } else if (selected === "usage_stats") {
        // probably future achievement command but for now we'll just keep some numbers
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-usage"]));
        const userData = JSON.parse(user.data);
        let stats = userData.stats;
        let c = 0;
        if (Object.keys(userData.stats).length != 7) {
          stats = {
            total_fish_caught: 0,
            total_fish_sold: 0,
            total_fish_value: 0,
            total_amount_earned: 0,
            total_shop_purchases: 0,
            total_commands_used: 0,
            total_xp_earned: 0,
          };
          userData.stats = stats;
          // console.log("updating with new stats");
          db.prepare("UPDATE users SET data = ? WHERE id = ?").run(JSON.stringify(userData), user.id);
        }
        for (const stat of Object.keys(stats)) {
          let split = blocks[c + 1].text.split(": ")[0];
          blocks[c + 1].text = split + ": `" + stats[stat] + "`";
          console.log(stat);
          if (stat == "total_fish_value" || stat == "total_amount_earned") {
            blocks[c + 1].text = split + ": `" + stats[stat] + " coins`";
          }
          // console.log(blocks[c + 1].text);
          c++;
        }

        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedOption: "usage_stats",
            },
          },
        });
      }
    },
    profile_boat_select: async ({ action, ack, client, respond, body }) => {
      await ack();
      let DATA = global.data;
      let boatId = action.selected_option.value;
      // get user data
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user with this profile doesn't exist in our database anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      let userData = JSON.parse(user.data);
      let boats = userData.boats;
      let boat = boats.find((b) => b.id === boatId);
      if (!boat) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user doesn't own this boat anymore.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      console.log(boat);
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-boats"]));
      blocks[0].text.text = `${user.username}'s Profile - Boats`;
      blocks[1].elements[0].options = boats.map((b) => {
        return {
          text: {
            type: "plain_text",
            text: `${DATA.boats[b.type].name} (id: ${b.id})`,
            emoji: true,
          },
          value: b.id,
        };
      });
      blocks[3].text = `**Boat Type**: \`${DATA.boats[boat.type].name}\``;
      blocks[4].text = `**ID**: \`${boat.id}\``;
      blocks[5].text = `**Durability**: \`${boat.durability}%\``;
      blocks[6].text = `**Total Trips**: \`${boat.stats.trips}\``;
      blocks[7].text = `**Total Distance**: \`${boat.stats.distance}\``;
      blocks[8].text = `**Total Fish**: \`${boat.stats.fish}\``;
      const attributes = DATA.boats[boat.type].stats;
      blocks[10].text = "**Speed**: `" + attributes.speed + " kt`";
      blocks[11].text = "**Capacity**: `" + attributes.capacity + " slots`";
      blocks[12].text = "**Sturdiness**: `" + attributes.sturdiness + "/20`";
      blocks[13].text = "**Range**: `" + attributes.range + " nautical miles`";
      blocks[14].text = "**Tier**: `" + DATA.tiers[boat.tier - 1] + "`";
      blocks[15].text = "**Addons**: `" + boat.addons.join(", ") + "`";
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "profile_view",
          event_payload: {
            userId: user.id,
            selectedBoat: boat.id,
          },
        },
      });
    },
    profile_tool_select: async ({ action, ack, client, respond, body }) => {
      await ack();
      let DATA = global.data;
      let tool_id = action.selected_option.value;

      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user with this profile doesn't exist in our database anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      let userData = JSON.parse(user.data);
      let tools = userData.equipment.filter((item) => item.etype === "tool");
      let tool = tools.find((t) => t.id === tool_id);
      if (!tool) {
        // just checks in case i miss something dumb
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user doesn't own this tool anymore.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-equipment"]));

      if (tools.length === 0) {
        blocks.splice(4, 11);
        blocks[1].elements[0].options[0].text.text = "No tools available";
        blocks[3].text =
          "This user doesn't have any tools in their inventory. When they buy or recieve tools, they will show up here. ";
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedOption: "tools",
            },
          },
        });
        return;
      }

      let tool_data = DATA.tools[tool.type];
      blocks[0].text.text = `${user.username}'s Profile - Tools`;
      blocks[3].text = `**Tool Type**: \`${tool_data.name}\``;
      blocks[4].text = `**ID**: \`${tool.id}\``;
      blocks[5].text = `**Description**: \`${tool_data.description}\``;
      blocks[6].text = `**Cost**: \`${tool_data.cost} coins\``;
      blocks[7].text = `**Level Requirement**: \`${tool_data.level}\``;
      blocks[8].text = `**Tier**: \`${tool_data.tier}\``;
      blocks[9].text = "**Durability**: \`" + tool.durability + "%\`";
      blocks[10].text = "**Effects**: \n`TBD`"; // also tbd
      blocks[12].text = `**Total Trips**: \`${tool.usage_stats.trips}\``;
      blocks[13].text = `**Total Fish**: \`${tool.usage_stats.fish_caught}\``;
      blocks[14].text = `**Total Weight of Fish**: \`${tool.usage_stats.fish_weight}\``;
      blocks[15].text = `**Total Value of Fish**: \`${tool.usage_stats.fish_value}\``;
      blocks[1].elements[0].options = tools.map((t) => {
        return {
          text: {
            type: "plain_text",
            text: DATA.tools[t.type].name + " (id: " + t.id + ")",
            emoji: true,
          },
          value: t.id,
        };
      });

      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "profile_view",
          event_payload: {
            userId: user.id,
            selectedOption: "tools",
          },
        },
      });
    },
    profile_bait_select: async ({ action, ack, client, respond, body }) => {
      await ack();
      let DATA = global.data;
      let bait_id = action.selected_option.value;
      // console.log("profile bait select action initiated");
      const bait_effect_templates = {
        catch_speed: " in catch speed",
        catch_nothing: " in chance of catching nothing",
        xp_multiplier: " in XP earned",
        catch_count: " in catch count range",
        weight: " in weight of fish caught",
        common_multiplier: " in chance of catching common fish",
        uncommon_multiplier: " in chance of catching uncommon fish",
        rare_multiplier: " in chance of catching rare fish",
        epic_multiplier: " in chance of catching epic fish",
        legendary_multiplier: " in chance of catching legendary fish",
        shiny_multiplier: " in chance of catching shiny fish",
        chroma_multiplier: " in chance of catching chroma fish",
        item_multiplier: " in chance of catching any item",
      };
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user with this profile doesn't exist in our database anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      let userData = JSON.parse(user.data);
      let baits = userData.equipment.filter((item) => item.etype === "bait");
      let bait = baits.find((b) => b.id === bait_id);
      if (!bait) {
        console.log("BAIT NOT FOUND");
        console.log(baits);
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like the user doesn't own this bait anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      let blocks = JSON.parse(JSON.stringify(DATA.blocks["profile-equipment"]));
      if (baits.length == 0) {
        blocks.splice(4, 11);
        blocks[1].elements[0].options[0].text.text = "No baits available";
        blocks[3].text =
          "This user doesn't have any baits in their inventory. When they buy or recieve baits, they will show up here. ";
        await client.chat.update({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
          metadata: {
            event_type: "profile_view",
            event_payload: {
              userId: user.id,
              selectedOption: "baits",
            },
          },
        });
      }
      let bait_data = DATA.baits[bait.type];
      blocks[0].text.text = `${user.username}'s Profile - Baits`;
      blocks[1].elements[0].placeholder.text = "Select a bait";
      blocks[1].elements[0].action_id = "profile_bait_select";
      blocks[3].text = `**Tool Type**: \`${bait_data.name}\``;
      blocks[4].text = `**ID**: \`${bait.id}\``;
      blocks[5].text = `**Description**: \`${bait_data.description}\``;
      blocks[6].text = `**Cost**: \`${bait_data.cost} coins\``;
      blocks[7].text = `**Level Requirement**: \`${bait_data.level}\``;
      blocks[8].text = `**Tier**: \`${bait_data.tier}\``;
      let effects_txt = "";
      for (const effect of Object.keys(bait_data.effects)) {
        if (typeof bait_data.effects[effect] === "number") {
          if (bait_data.effects[effect] > 0) {
            effects_txt += `\`Increase ${bait_effect_templates[effect]} by ${bait_data.effects[effect] * 100}%\`\n`;
          } else {
            effects_txt += `\`Decrease ${bait_effect_templates[effect]} by ${Math.abs(bait_data.effects[effect] * 100)}%\`\n`;
          }
        } else {
          effects_txt += `\`Increase ${bait_effect_templates[effect]} by ${bait_data.effects[effect][0]} to ${bait_data.effects[effect][1]}\`\n`;
        }
      }
      blocks[9].text = `**Durability**: \`${bait.durability}%\``;
      blocks[10].text = `**Effects**: \n` + effects_txt;
      blocks[12].text = `**Total Trips**: \`${bait.usage_stats.trips}\``;
      blocks[13].text = `**Total Fish**: \`${bait.usage_stats.fish_caught}\``;
      blocks[14].text = `**Total Weight of Fish**: \`${bait.usage_stats.fish_weight}\``;
      blocks[15].text = `**Total Value of Fish**: \`${bait.usage_stats.fish_value}\``;
      blocks[1].elements[0].options = baits.map((b) => {
        return {
          text: {
            type: "plain_text",
            text: DATA.baits[b.type].name + " (id: " + b.id + ")",
            emoji: true,
          },
          value: b.id,
        };
      });
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "profile_view",
          event_payload: {
            userId: user.id,
            selectedOption: "baits",
          },
        },
      });
    },
  },
};
