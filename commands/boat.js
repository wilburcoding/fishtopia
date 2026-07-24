module.exports = {
  name: "/f-boat",
  description: "View all and manage your boats",
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

    const user_data = JSON.parse(user.data);
    const boats = user_data.boats; // should always exist
    // console.log(user_data.boats);
    const blocks = JSON.parse(JSON.stringify(DATA.blocks["boats-main"]));
    if (boats.length === 0) {
      blocks[0].text.text = `${user.username}'s Boats`;
      blocks[1].text.text = `You don't have any boats yet. Use the /f-shop command to buy a boat. `;
      blocks.splice(2, blocks.length - 3);
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
        metadata: {
          event_type: "boats_main",
          event_payload: {
            userId: user.id,
            boatId: null,
          },
        },
      });
      return;
    }
    blocks[0].text.text = `${user.username}'s Boats`;
    blocks[1].text.text = `Boat Overview (${boats.length})`;
    const boat = boats[0];
    const boat_data = DATA.boats[boat.type];
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
      blocks[16].elements[0].options.splice(0, 1);
    } else {
      blocks[16].elements[0].options[0] = {
        text: {
          type: "plain_text",
          text: "Set as Default",
          emoji: true,
        },
        value: "default",
      };
    }
    blocks[17].elements[0].options = boats.map((b, index) => {
      return {
        text: {
          type: "plain_text",
          text: `${b.type} (id: ${b.id})`,
          emoji: true,
        },
        value: String(b.id),
      };
    });
    // console.log({
    //     metadata: {
    //     event_type: "boats_main",
    //     event_payload: {
    //       userId: user.id,
    //       boatId: boat.id,
    //     },
    //   },
    // })
    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "boats_main",
        event_payload: {
          userId: user.id,
          boatId: boat.id,
        },
      },
    });
  },
  actions: {
    boat_action_select: async ({ action, ack, client, response, body }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata.event_payload;
      const boatId = metadata.boatId;
      const userId = metadata.userId;
      const actionValue = action.selected_option.value;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      // console.log(boatId, userId, actionValue);
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
      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      const boat = boats.find((b) => b.id === boatId);
      const boat_data = DATA.boats[boat.type];
      if (!boat) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like this user doesn't own this boat anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      // just use a confirmation block
      let blocks2 = JSON.parse(JSON.stringify(DATA.blocks["confirm"]));
      if (actionValue === "default") {
        blocks2[0].body.text =
          "Are you sure you want to set this boat as your default boat? This will make it the boat that is used for fishing trips by default. ";
      } else if (actionValue === "sell") {
        const sell_price = Math.floor(
          boat_data.price * 0.7 * (boat.durability / 100),
        ); // tentatively 70% of the sell price
        blocks2[0].body.text = `Are you sure you want to sell this boat for ${sell_price} coins? This action is irreversible!`;
      } else if (actionValue === "repair") {
        // might make this not require a confirmation in the future
        const repair_price = Math.floor(boat_data.price * 0.08); // tentatively 8% of the sell price
        blocks2[0].body.text = `Are you sure you want to repair this boat for ${repair_price} coins? This will increase its durability by 25%. `;
        if (user.coins < repair_price) {
          const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
          blocks[0].text.text = `You don't have enough coins to repair this boat. You need at least ${repair_price} coins to repair this boat. `;
          await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks,
          });
          return;
        }
      }
      blocks2[0].actions[0].action_id = "boat_action_confirm";
      blocks2[0].actions[1].action_id = "boat_action_cancel";
      //   console.log({
      //             metadata: {
      //       event_type: "boats_confirm",
      //       event_payload: {
      //         userId: user.id,
      //         boatId: boat.id,
      //         actionType: actionValue,
      //       },
      //     },
      //   })
      await client.chat.postMessage({
        channel: body.channel.id,
        blocks: blocks2,
        ts: body.message.ts,
        metadata: {
          event_type: "boats_confirm",
          event_payload: {
            userId: user.id,
            boatId: boat.id,
            actionType: actionValue,
          },
        },
      });
      //   await client.chat.update({
      //     channel: body.channel.id,
      //     blocks: blocks2,
      //     ts: body.message.ts,
      //     metadata: {
      //       event_type: "boats_main",
      //       event_payload: {
      //         userId: user.id,
      //         boatId: boat.id,
      //         actionType: actionValue,
      //       },
      //     },
      //   });
    },
    boat_select: async ({ action, ack, client, response, body }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      let boat_id = action.selected_option.value;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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

      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      if (boats.length === 0) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["boats-main"]));
        blocks[0].text.text = `${user.username}'s Boats`;
        blocks[1].text.text = `You don't have any boats yet. Use the /f-shop command to buy a boat.`;
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
          metadata: {
            event_type: "boats_main",
            event_payload: {
              userId: user.id,
              boatId: null,
            },
          },
        });
      }
      const boat = boats.find((b) => b.id === boat_id);
      if (!boat) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = "It looks like this user doesn't own this boat. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
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
        blocks[16].elements[0].options.splice(0, 1);
      } else {
        blocks[16].elements[0].options[0] = {
          text: {
            type: "plain_text",
            text: "Set as Default",
            emoji: true,
          },
          value: "default",
        };
      }
      blocks[17].elements[0].options = boats.map((b, index) => {
        return {
          text: {
            type: "plain_text",
            text: `${b.type} (id: ${b.id})`,
            emoji: true,
          },
          value: String(b.id),
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
            boatId: boat.id,
          },
        },
      });
    },
    boat_action_confirm: async ({ action, ack, client, respond, body }) => {
      await ack();
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      const boatId = metadata.boatId;
      const actionType = metadata.actionType;
      const db = global.db;
      const DATA = global.data;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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
      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      const boat = boats.find((b) => b.id === boatId);
      const boat_data = DATA.boats[boat.type];
      if (!boat) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like this user doesn't own this boat anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      const index = boats.indexOf(boat);
      if (actionType === "default") {
        blocks[0].text.text =
          "You have successfully set this boat as your default boat.";
      } else if (actionType === "sell") {
        const sell_price = Math.floor(
          boat_data.price * 0.7 * (boat.durability / 100),
        ); // 70%
        blocks[0].text.text = `You have successfully sold this boat for ${sell_price} coins.`;
        boats.splice(index, 1);
        user.coins += sell_price;
      } else if (actionType === "repair") {
        const repair_price = boat_data.price * 0.08; // 8%
        blocks[0].text.text = `You have successfully repaired this boat for ${repair_price} coins. `;
        boat.durability = Math.min(boat.durability + 25, 100);
        user.coins -= repair_price;
      }
      await db
        .prepare("UPDATE users SET coins = ?, data = ? WHERE id = ?")
        .run(user.coins, JSON.stringify(user_data), user.id);
      await client.chat.update({
        channel: body.channel.id,
        user: body.user.id,
        ts: body.message.ts,
        blocks: blocks,
      });
      //   await respond({
      //     delete_original: true,
      //   });
    },
    boat_action_cancel: async ({ action, ack, client, respond, body }) => {
      await ack();
      const metadata = body.message.metadata.event_payload;
      const userId = metadata.userId;
      const boatId = metadata.boatId;
      const actionType = metadata.actionType;
      const db = global.db;
      const DATA = global.data;
      // still do checks but this will otherwise always lead to a message saying the action was canceled
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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
      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      const boat = boats.find((b) => b.id === boatId);
      if (!boat) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It looks like this user doens't own this boat anymore. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      blocks[0].text.text =
        "You canceled the action for this boat. No changes were made.";
      //   await respond({
      //     delete_original: true,
      //   });
      await client.chat.update({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks,
        ts: body.message.ts,
      });
    },
    refresh_boats: async ({ action, ack, client, respond, body }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const boatId = metadata.event_payload.boatId;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
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

      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      if (boats.length === 0) {
        // new checks
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["boats-main"]));
        blocks[0].text.text = `${user.username}'s Boats`;
        blocks[1].text.text =
          "You don't have any boats yet. Try using the /f-shop command to buy one. ";
        blocks.splice(2, blocks.length - 3);
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          user: body.user.id,
          blocks: blocks,
          metadata: {
            event_type: "boats_main",
            event_payload: {
              userId: user.id,
              boatId: null
            }
          }
        });
        return;
      }
      let boat = boats.find((b) => b.id === boatId);
      if (!boat) {
        boat = boats[0];
      }
      
      // basically copy and paste from main execute function
      blocks[0].text.text = `${user.username}'s Boats`;
      blocks[1].text.text = `Boat Overview (${boats.length})`;
      blocks[2].text = `**Boat Type**: \`${boat_data.name}\``;
      blocks[3].text = `**ID**: \`${boat.id}\``;
      blocks[4].text = `**Durability**: \`${boat.durability}%\``;
      blocks[5].text = `**Total Trips**: \`${boat.stats.trips}\``;
      blocks[6].text = `**Total Distance** \`${boat.stats.distance}\``;
      blocks[7].text = `**Total Fish**: \`${boat.stats.fish}\``;
      blocks[9].text = `**Speed**: \`${boat_data.stats.speed}\``;
      blocks[10].text = `**Capacity**: \`${boat_data.stats.capacity}\``;
      blocks[11].text = `**Sturdiness**: \`${boat_data.stats.sturdiness}\``;
      blocks[12].text = `**Range**: \`${boat_data.stats.range}\``;
      blocks[13].text =`**Tier**: \`${boat_data.tier}\``;
      blocks[14].text = `**Addons**: \`${boat.addons.join(", ")}\``;
      if (boat.default) {
        blocks[16].elements[0].options.splice(0, 1);
      } else {
        blocks[16].elements[0].options[0] = {
          text: {
            type: "plain_text",
            text: "Set as Default",
            emoji: true,
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
        user: body.user.id,
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
    },
  },
};
