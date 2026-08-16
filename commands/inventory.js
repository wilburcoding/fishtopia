function populateInventoryBlocks(user_data, DATA) {
  const inventory = user_data.inventory;
  let counts = {};
  for (const item of inventory) {
    if (item.variant == null) {
      if (counts[item.type]) {
        counts[item.type].push({ weight: item.weight, value: item.value });
      } else {
        counts[item.type] = [{ weight: item.weight, value: item.value }];
      }
    } else {
      const key = `${item.type}-${item.variant}`;
      if (counts[key]) {
        counts[key].push({ weight: item.weight, value: item.value });
      } else {
        counts[key] = [{ weight: item.weight, value: item.value }];
      }
    }
  }
  let total_fish = 0;
  let total_types = Object.keys(counts).length;
  for (const key in counts) {
    total_fish += counts[key].length;
  }
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["inventory"]));
  blocks[1].text.text = `${total_fish} fish in ${total_types} type(s)`;
  let fish_list = "";
  for (const key in counts) {
    const fish_name = key.includes("-") ? key.split("-")[0] : key;
    const variant = key.includes("-") ? key.split("-")[1] : null;
    const v_text = variant
      ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
      : "";
    const count = counts[key].length;
    const fish_data = DATA.fish[fish_name];
    fish_list += `**${fish_data.name}${v_text}**: \`${count}x\` \n`;
  }
  blocks[2].text = fish_list;
  blocks[4].elements[0].options = Object.keys(counts).map((key) => {
    const fish_name = key.includes("-") ? key.split("-")[0] : key;
    const variant = key.includes("-") ? key.split("-")[1] : null;
    const v_text = variant
      ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
      : "";
    const fish_data = DATA.fish[fish_name];
    return {
      text: {
        type: "plain_text",
        text: `${fish_data.name}${v_text} (${counts[key].length}x)`,
        emoji: true,
      },
      value: key,
    };
  });
  blocks[4].elements[0].options.push({
    text: {
        type: "plain_text",
        text: "All Fish",
        emoji: true,
    },
    value: "all",
  });
  return blocks;
}

module.exports = {
  name: "/f-inventory",
  description: "View your inventory",
  execute: async ({ command, ack, respond, client }) => {
    const DATA = global.data;
    await ack();
    const db = global.db;
    const user = db
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
    // const inventory = user_data.inventory;
    // let counts = {};
    // for (const item of inventory) {
    //   if (item.variant == null) {
    //     if (counts[item.type]) {
    //       counts[item.type].push({ weight: item.weight, value: item.value });
    //     } else {
    //       counts[item.type] = [{ weight: item.weight, value: item.value }];
    //     }
    //   } else {
    //     const key = `${item.type}-${item.variant}`;
    //     if (counts[key]) {
    //       counts[key].push({ weight: item.weight, value: item.value });
    //     } else {
    //       counts[key] = [{ weight: item.weight, value: item.value }];
    //     }
    //   }
    // }
    // let total_fish = 0;
    // let total_types = Object.keys(counts).length;
    // for (const key in counts) {
    //   total_fish += counts[key].length;
    // }
    // console.log(total_fish);
    // console.log(total_types);

    // TODO: Empty inventory check

    // let blocks = JSON.parse(JSON.stringify(DATA.blocks["inventory"]));
    // blocks[1].text.text = `${total_fish} fish in ${total_types} type(s)`;
    // let fish_list = "";
    // for (const key in counts) {
    //   const fish_name = key.includes("-") ? key.split("-")[0] : key;
    //   const variant = key.includes("-") ? key.split("-")[1] : null;
    //   const v_text = variant
    //     ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
    //     : "";
    //   const count = counts[key].length;
    //   const fish_data = DATA.fish[fish_name];
    //   fish_list += `**${fish_data.name}${v_text}**: \`${count}x\` \n`;
    // }
    // blocks[2].text = fish_list;
    // populate static select menu with fish types
    // blocks[4].elements[0].options = Object.keys(counts).map((key) => {
    //   const fish_name = key.includes("-") ? key.split("-")[0] : key;
    //   const variant = key.includes("-") ? key.split("-")[1] : null;
    //   const v_text = variant
    //     ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
    //     : "";
    //   const fish_data = DATA.fish[fish_name];
    //   return {
    //     text: {
    //       type: "plain_text",
    //       text: `${fish_data.name}${v_text} (${counts[key].length}x)`,
    //       emoji: true,
    //     },
    //     value: key,
    //   };
    // });
    // blocks[4].elements[0].options.push({
    //   text: {
    //     type: "plain_text",
    //     text: "All Fish",
    //     emoji: true,
    //   },
    //   value: "all",
    // });
    let blocks = populateInventoryBlocks(user_data, DATA);

    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: JSON.stringify({
        type: "none", // fish type selected
        amt: 1, // amount of fish entered
      }),
    });
    // metadata for this command would probably just be the different options the user supplies
  },
  actions: {
    inventory_fish_select: async ({ action, ack, client, body, response }) => {
      await ack();
      const db = global.db;
      const DATA = global.data;
      const user = db
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
      const user_data = JSON.parse(user.data);

      // realistically all u gotta do is reupdate it but show max fish atm somewhere
    },
  },
};
