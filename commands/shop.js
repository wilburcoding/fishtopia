function populateBlock(category, searchQuery, page_num, DATA, user) {
  const blocks = JSON.parse(JSON.stringify(DATA.blocks["shop-main"]));
  let shop_items = [];
  for (const item of Object.keys(DATA.baits)) {
    let data = DATA.baits[item];
    data.id = item;
    data.stype = "baits";
    shop_items.push(data);
  }
  for (const item of Object.keys(DATA.boats)) {
    let data = DATA.boats[item];
    data.id = item;
    data.stype = "boats";
    shop_items.push(data);
  }
  for (const item of Object.keys(DATA.tools)) {
    let data = DATA.tools[item];
    data.id = item;
    data.stype = "tools";
    shop_items.push(data);
  }
  let filtered_items = shop_items.filter(
    (item) =>
      item.stype.toLowerCase() === category.toLowerCase() &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  const max_len = filtered_items.length;
  if (filtered_items.length > 10) {
    filtered_items = filtered_items.slice((page_num - 1) * 10, page_num * 10);
  }
  const cstr = category.charAt(0).toUpperCase() + category.slice(1);
  blocks[0].text.text = `Shop for ${user.username}`;
  blocks[1].text.text = `Showing ${cstr} (${filtered_items.length})`;
  blocks[2].text = `${searchQuery ? `Searching for \`${searchQuery}\`` : "All items"} in *${cstr}* category. Showing ${filtered_items.length}/${max_len} items (Page ${page_num}/${Math.ceil(max_len / 10)}).`;
  blocks[3].elements = filtered_items.map((item) => {
    return {
      type: "card",
      block_id: `shop_${item.stype}_${item.id}`,
      title: {
        type: "mrkdwn",
        text: `${item.name}`,
        verbatim: false,
      },
      subtitle: {
        type: "mrkdwn",
        text: `Tier ${item.tier} ${item.stype.slice(0, item.stype.length - 1)}`,
      },
      body: {
        type: "mrkdwn",
        text: `${item.description}\n*Cost*: \`${item.cost}\``,
        verbatim: false,
      },
      actions: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Purchase",
            emoji: true,
          },
          value: `${item.stype}_${item.id}`,
          action_id: `shop_purchase`,
        },
      ],
    };
  });
  return blocks;
}

module.exports = {
  name: "/f-shop",
  description: "Visit the shop to buy items",
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
    const blocks = populateBlock("baits", "", 1, DATA, user);
    user_data.stats.total_commands_used += 1;
    db.prepare("UPDATE users SET data = ? WHERE id = ?").run(
      JSON.stringify(user_data),
      user.id
    );
    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "shop_main",
        event_payload: {
          userId: user.id,
          shopPage: 1,
          searchQuery: "",
          category: "baits",
        },
      },
    });
  },
  actions: {
    shop_next: async ({ action, ack, client, response, body }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const metadata = body.message.metadata;
      const userId = metadata.event_payload.userId;
      const shopPage = metadata.event_payload.shopPage;
      const searchQuery = metadata.event_payload.searchQuery;
      const category = metadata.event_payload.category;
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

      const newPage = shopPage + 1;
      // check if max page
      let shop_items = [];
      for (const item of Object.keys(DATA.baits)) {
        let data = DATA.baits[item];
        data.id = item;
        data.stype = "baits";
        shop_items.push(data);
      }
      for (const item of Object.keys(DATA.boats)) {
        let data = DATA.boats[item];
        data.id = item;
        data.stype = "boats";
        shop_items.push(data);
      }
      for (const item of Object.keys(DATA.tools)) {
        let data = DATA.tools[item];
        data.id = item;
        data.stype = "tools";
        shop_items.push(data);
      }
      const filtered_items = shop_items.filter(
        (item) =>
          item.stype.toLowerCase() === category.toLowerCase() &&
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      const maxPage = Math.ceil(filtered_items.length / 10);

      if (newPage > maxPage) {
        // do nothing if max page reached
        return;
      }

      const blocks = populateBlock(category, searchQuery, newPage, DATA, user);
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
            event_type: "shop_main",
            event_payload: {
                userId: user.id,
                shopPage: newPage,
                searchQuery: searchQuery,
                category: category
            }
        }
      });
    },
    shop_prev: async ({ action, ack, client, response, body }) => {
        await ack();
        const db = global.db;
        const DATA = global.data;
        const metadata = body.message.metadata;
        const userId = metadata.event_payload.userId;
        const shopPage = metadata.event_payload.shopPage;
        const searchQuery = metadata.event_payload.searchQuery;
        const category = metadata.event_payload.category;
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

        const newPage = shopPage - 1;
        if (newPage < 1) {
            return;
        }

        const blocks = populateBlock(category, searchQuery, newPage, DATA, user);
        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
                event_type: "shop_main",
                event_payload: {
                    userId: user.id,
                    shopPage: newPage,
                    searchQuery: searchQuery,
                    category: category
                }
            }
        });

    },
    shop_category_select: async ({ action, ack, client, response, body }) => {
        await ack();
        const db = global.db;
        const DATA = global.data;
        const metadata = body.message.metadata;
        const userId = metadata.event_payload.userId;
        const shopPage = 1; // reset to page 1 when category changes
        const searchQuery = metadata.event_payload.searchQuery;
        const category = action.selected_option.value;
        console.log(category);
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

        const blocks = populateBlock(category, searchQuery, shopPage, DATA, user);
        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
                event_type: "shop_main",
                event_payload: {
                    userId: user.id,
                    shopPage: shopPage,
                    searchQuery: searchQuery,
                    category: category
                }
            }
        })
    },
    shop_search: async ({action, ack, client, response, body}) => {
        await ack();
        const db = global.db;
        const DATA = global.data;
        const metadata = body.message.metadata;
        const userId = metadata.event_payload.userId;
        const shopPage = 1; // reset to page 1 when new searc h query
        const searchQuery = body.state.values["shop_search_input_block"]["plain_text_input-action"].value;
        const category = metadata.event_payload.category;
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        if (!user) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = "You need to get started before you can use this command. Try using the /f-start command to get started. ";
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: boyd.user.id,
                blocks: blocks
            });
            return;
        }

        const blocks = populateBlock(category, searchQuery, shopPage, DATA, user);
        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
                event_type: "shop_main",
                event_payload: {
                    userId: user.id,
                    shopPage: shopPage,
                    searchQuery: searchQuery,
                    category: category
                }
            }
        });


    },
    clear_search: async ({ action, ack, client, response, body}) => {
        await ack();
        const db = global.db;
        const DATA = global.data;
        const metadata = body.message.metadata;
        const userId = metadata.event_payload.userId;
        const shopPage = 1;
        const searchQuery = "";
        const category = metadata.event_payload.category;
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
        const blocks = populateBlock(category, searchQuery, shopPage, DATA, user);
        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: blocks,
            metadata: {
                event_type: "shop_main",
                event_payload: {
                    userId: user.id,
                    shopPage: shopPage,
                    searchQuery: searchQuery,
                    category: category
                }
            }
        });


    },
    shop_purchase: async ({ action, ack, client, response, body }) => {
        // no confirmation. It's definitely not in a spot for accidental pressing
        await ack();
        const db = global.db;
        const DATA = global.data;
        const metadata = body.message.metadata;
        const userId = metadata.event_payload.userId;
        const shopPage = metadata.event_payload.shopPage;
        const searchQuery = metadata.event_payload.searchQuery;
        const category = metadata.event_payload.category;
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

        let user_data = JSON.parse(user.data);
        const val = action.value;
        const stype = val.split("_")[0];
        const itemId = val.split("_")[1];
        let item = null;
        if (stype === "baits") {
            item = DATA.baits[itemId];
        } else if (stype === "boats") {
            item = DATA.boats[itemId];
        } else if (stype === "tools") {
            item = DATA.tools[itemId];
        }

        // check if user has enough coins
        if (user.coins <item.cost) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = "You don't have enough coins to purchase this item. You need `" + item.cost + "` coins to purchase this item. ";
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                blocks: blocks
            });
            return;
        }

        // deduct coins and add item to user data
        user.coins -= item.cost;
        console.log(itemId);
        user_data.equipment.push({
            id: global.generateID(4),
            type: itemId,
            durability: 100,
            usage_stats: {
                trips: 0,
                fish_caught: 0,
                fish_weight: 0,
                fish_value: 0
            },
            etype: stype.slice(0, stype.length - 1)
        });
        const new_id = user_data.equipment[user_data.equipment.length - 1].id;
        user_data.stats.total_shop_purchases += 1;
        db.prepare("UPDATE users SET coins = ?, data = ? WHERE id = ?").run(user.coins, JSON.stringify(user_data), user.id);
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text = "You have successfully purchased 1x `" + item.name + "` for `" + item.cost + "` coins. The item ID is `" + new_id + "`";
        await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks
        });
     }
  },
};
