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
    let item = equipment[0]; // get first item
    console.log(item);
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
            effects += `\`Decrease ${bait_effect_templates[effect]} by ${Math.abs(value) * 100}%\``;
          } else {
            effects+= `\`Increase ${bait_effect_templates[effect]} by ${value * 100}%\``;
          }
        } else {
            // has to be an array
            effects += `\`Increase ${bait_effect_templates[effect]} by ${value[0]} to ${value[1]}\``;
        }
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
    if (item.etype == "bait") {
        blocks.splice(8, 0, { 
            "type": "markdown",
            "text": `**Sturdiness**: \`${itemData.sturdiness}\``
        });
    }

    blocks[17].elements[0].options = equipment.map((item) => {
        if (item.etype == "bait") {
            return {
                "text": {
                    "type": "plain_text",
                    "text": `${DATA.baits[item.type].name} (ID: ${item.id})`,
                    "emoji": true
                },
                "value": item.etype + "-" + item.id
            }
        } 
        // otherwise tool
        return {
            "text": {
                "type": "plain_text",
                "text": `${DATA.tools[item.type].name} (ID: ${item.id})`,
                "emoji": true
            },
            "value": item.etype + "-" + item.id

        }
    });


    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
    });
  },
  actions: {},
};
