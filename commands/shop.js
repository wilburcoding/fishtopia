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
    const category = "baits";
    const searchQuery = "";
    // metadata to store: user_id, shop_page, search query,
    const cstr = category.charAt(0).toUpperCase() + category.slice(1);
    const filtered_items = shop_items.filter(
      (item) =>
        item.stype.toLowerCase() === category.toLowerCase() &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    console.log(shop_items.filter((item) => item.stype == "tools").length);
    blocks[0].text.text = `Shop for ${user.username}`;
    blocks[1].text.text = `Showing ${cstr} (${filtered_items.length})`;
    blocks[2].text = `${searchQuery ? `Searching for \`${searchQuery}\`` : "All items"} in **${cstr}** category. Showing ${filtered_items.length} items.`;

    // populate items
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
          verbatim: false
        },
        actions: [
            {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Purchase",
                    emoji: true
                },
                action_id: `purchase_${item.stype}_${item.id}`,
            }
        ]
      };
    });

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
        },
      },
    });
  },
  actions: {},
};
