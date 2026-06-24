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
      const blocks = DATA.blocks["error"];
      blocks[0].text.text =
        "You need to get started before you can use this command. Try using the /f-start command to get started. ";
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
    }
    // View profile
    console.log(command.text);
    const text = command.text; // check if user ID was provided
    if (text.startsWith("<@")) {
      const userId = text.match(/<@(\w+)>/)[1];
      const targetUser = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId);
      if (!targetUser) {
        const blocks = DATA.blocks["error"];
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
    console.log(user);
    let blocks = DATA.blocks["profile-overview"];
    const created_date = new Date(user.created_at);
    const created_str = `${created_date.getFullYear()}-${(created_date.getMonth() + 1).toString().padStart(2, "0")}-${created_date.getDate()}`;
    blocks[0].text.text = `${user.username}'s Profile - Overview`;
    blocks[1].text = `**Slack ID**: \`${user.id}\``;
    blocks[2].text = `**Coins Balance**: \`${user.coins}\``;
    blocks[3].text = `**Gold Balance**: \`${user.gold}\``;
    blocks[4].text = `**Level**: \`${user.level}\ (${user.xp}/${DATA.levels[user.level.toString()]})\``;
    blocks[5].text = `**Account Created**: \`${created_str}\``;
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
      console.log(action);
      console.log(body);
      let DATA = global.data;
      const selected = action.selected_option.value;
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      console.log(metadata);
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (!user) {
        let blocks = DATA.blocks["error"];
        blocks[0].text.text =
          "It looks like that user doesn't exist in our database anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
      }

      if (selected === "overview") {
        let blocks = DATA.blocks["profile-overview"];
        const created_date = new Date(user.created_at);
        const created_str = `${created_date.getFullYear()}-${(created_date.getMonth() + 1).toString().padStart(2, "0")}-${created_date.getDate()}`;
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
        let blocks = DATA.blocks["profile-completion"];
        blocks[0].text.text = `${user.username}'s Profile - Completion`;
        const userData = JSON.parse(user.data);
        const completion = userData.completion;
        let totalCount = 0;
        let totalCompleted = 0;

        for (const map of Object.keys(completion)) {
          const count = 0;
          const total = Object.keys(completion[map]).length;
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
        let blocks = DATA.blocks["profile-boats"];
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
        blocks[5].text = `**Total Trips**: \`${boat.stats.trips}\``;
        blocks[6].text = `**Total Distance**: \`${boat.stats.distance}\``;
        blocks[7].text = `**Total Fish**: \`${boat.stats.fish}\``;
        // blocks[8].text = "**Addons**: `" + boat.addons.join(", ") + "`";
        // attributes
        const attributes = DATA.boats[boat.type].stats;
        blocks[9].text = "**Speed**: `" + attributes.speed + " kt`";
        blocks[10].text = "**Capacity**: `" + attributes.capacity + " slots`";
        blocks[11].text = "**Durability**: `" + attributes.durability + "/20`";
        blocks[12].text =
          "**Range**: `" + attributes.range + " nautical miles`";
        blocks[13].text = "**Addons**: `" + boat.addons.join(", ") + "`";

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
        let blocks = DATA.blocks["error"];
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
        let blocks = DATA.blocks["error"];
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
      let blocks = DATA.blocks["profile-boats"];
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
      blocks[5].text = `**Total Trips**: \`${boat.stats.trips}\``;
      blocks[6].text = `**Total Distance**: \`${boat.stats.distance}\``;
      blocks[7].text = `**Total Fish**: \`${boat.stats.fish}\``;
      const attributes = DATA.boats[boat.type].stats;
      blocks[9].text = "**Speed**: `" + attributes.speed + " kt`";
      blocks[10].text = "**Capacity**: `" + attributes.capacity + " slots`";
      blocks[11].text = "**Durability**: `" + attributes.durability + "/20`";
      blocks[12].text = "**Range**: `" + attributes.range + " nautical miles`";
      blocks[13].text = "**Addons**: `" + boat.addons.join(", ") + "`";
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks
      })
    },
  },
};
