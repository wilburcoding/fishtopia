function populateInventoryBlocks(user_data, DATA, metadata) {
  const type = metadata.type;
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
  blocks[1].text.text = `${total_fish} fish/items in ${total_types} type(s)`;
  let fish_list = "";
  for (const key in counts) {
    const fish_name = key.includes("-") ? key.split("-")[0] : key;
    const variant = key.includes("-") ? key.split("-")[1] : null;
    const v_text = variant
      ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
      : "";
    const count = counts[key].length;
    if (Object.keys(DATA.fish).includes(fish_name)) {
      const fish_data = DATA.fish[fish_name];
      fish_list += `**${fish_data.name}${v_text}**: \`${count}x\` \n`;
    } else {
      // has to be item
      const item_data = DATA.items[fish_name];
      fish_list += `**${item_data.name}${v_text}**: \`${count}x\` \n`;
    }
    // const fish_data = DATA.fish[fish_name];
    // fish_list += `**${fish_data.name}${v_text}**: \`${count}x\` \n`;
  }
  blocks[2].text = fish_list;
  blocks[4].elements[0].options = Object.keys(counts).map((key) => {
    const fish_name = key.includes("-") ? key.split("-")[0] : key;
    const variant = key.includes("-") ? key.split("-")[1] : null;
    const v_text = variant
      ? ` (${variant.charAt(0).toUpperCase() + variant.slice(1)})`
      : "";
    const fish_data = DATA.fish[fish_name];
    if (fish_data === undefined) {
      const item_data = DATA.items[fish_name];
      return {
        text: {
          type: "plain_text",
          text: `${item_data.name} (${counts[key].length}x)`,
          emoji: true,
        },
        value: key,
      };
    }
    // console.log({
    //   text: {
    //     type: "plain_text",
    //     text: `${fish_data.name}${v_text} (${counts[key].length}x)`,
    //     emoji: true,
    //   },
    //   value: key,
    // });
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
      text: "All Fish/Items",
      emoji: true,
    },
    value: "all",
  });
  if (type !== "none") {
    let tlabel = "Select All";
    if (type !== "all") {
      let fish = type.includes("-") ? type.split("-")[0] : type;
      const variant = type.includes("-") ? type.split("-")[1] : null;
      let vtext =
        variant == null
          ? ""
          : `(${variant.charAt(0).toUpperCase() + variant.slice(1)}) `;
      const fish_data = DATA.fish[fish];
      if (fish_data === undefined) {
        const item_data = DATA.items[fish];
        tlabel = `${item_data.name} `;
      } else {
        tlabel = `${fish_data.name} ${vtext}`;
      }
    }
    // console.log(counts);
    // console.log({
    //     text: {
    //         type: "plain_text",
    //         text: tlabel + "(" + counts[type].length + "x)",
    //         emoji: true
    //     },
    //     value: type
    // });
    if (type === "all") {
      blocks[4].elements[0].initial_option = {
        text: {
          type: "plain_text",
          text: "All Fish/Items",
          emoji: true,
        },
        value: "all",
      };
    } else {
      blocks[4].elements[0].initial_option = {
        text: {
          type: "plain_text",
          text: tlabel + "(" + counts[type].length + "x)",
          emoji: true,
        },
        value: type,
      };
    }
  }
  console.log(metadata);

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
    user_data.stats.total_commands_used += 1;
    db.prepare("UPDATE users SET data = ? WHERE id = ?").run(
      JSON.stringify(user_data),
      user.id
    );
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
    let blocks = populateInventoryBlocks(user_data, DATA, {
      type: "none",
      amt: "", // amt doesn't really matter here but whatever
    });

    await client.chat.postMessage({
      channel: command.channel_id,
      user: command.user_id,
      blocks: blocks,
      metadata: {
        event_type: "inventory_view",
        event_payload: {
          type: "none",
          amt: "", // amt doesn't really matter
        },
      },
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
      let metadata = body.message.metadata.event_payload;
      const new_type = action.selected_option.value;
      metadata.type = new_type;
      const blocks = populateInventoryBlocks(user_data, DATA, metadata);
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        metadata: {
          event_type: "inventory_view",
          event_payload: metadata,
        },
      });
    },
    inventory_sell: async ({ action, ack, client, body, response }) => {
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

      // otherwise, check data
      let amt =
        body.state.values["inventory_sell_amt"]["inventory_sell_amt_input"]
          .value;
      if (
        amt === null ||
        amt === undefined ||
        isNaN(amt) ||
        parseInt(amt) <= 0
      ) {
        amt = 1; // default to 1 if invalid
      }
      // check if user has enough
      const user_data = JSON.parse(user.data);
      const metadata = body.message.metadata.event_payload;
      const type = metadata.type; // type of fish or all
      let counts = {};
      let index = 0;
      for (const item of user_data.inventory) {
        if (item.variant == null) {
          if (counts[item.type]) {
            counts[item.type].push({
              weight: item.weight,
              value: item.value,
              index: index,
            });
          } else {
            counts[item.type] = [
              { weight: item.weight, value: item.value, index: index },
            ];
          }
        } else {
          const key = `${item.type}-${item.variant}`;
          if (counts[key]) {
            counts[key].push({
              weight: item.weight,
              value: item.value,
              index: index,
            });
          } else {
            counts[key] = [
              { weight: item.weight, value: item.value, index: index },
            ];
          }
        }
        index++;
      }
      let sold = []; // juet keep track of everything so we can    a results thing later
      let total_profit = 0;
      console.log(type);
      if (type === "all") {
        let total_fish = 0;
        for (const key in counts) {
          total_fish += counts[key].length;
        }
        // if (parseInt(amt) > total_fish) {
        //     const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        //     blocks[0].text.text = `You only have ${total_fish} fish in your inventory. `;
        //     await client.chat.postEphemeral({
        //         channel: body.channel.id,
        //         user: body.user.id,
        //         blocks: blocks
        //     });
        //     return;
        // }
        for (const key in counts) {
          const fish_list = counts[key];
          const fish_type = key.includes("-") ? key.split("-")[0] : key;
          const fish_variant = key.includes("-") ? key.split("-")[1] : null;
          let data = DATA.fish[fish_type];
          if (data === undefined) {
            // list of items
            data = DATA.items[fish_type];
            for (let i = 0; i < fish_list.length; i++) {
              sold.push({
                type: key,
                item: true,
                value: fish_list[i].value,
                name: data.name,
                index: fish_list[i].index,
              });
              total_profit += fish_list[i].value;
            }
            continue;
          }
          const v_text = fish_variant
            ? ` (${fish_variant.charAt(0).toUpperCase() + fish_variant.slice(1)})`
            : "";

          for (let i = 0; i < fish_list.length; i++) {
            sold.push({
              type: key,
              item: false,
              weight: fish_list[i].weight,
              value: fish_list[i].value,
              name: fish_data.name + v_text,
              index: fish_list[i].index,
            });
            total_profit += fish_list[i].value;
          }
        }
        console.log(sold);
        console.log(total_profit);
      } else {
        const fish_list = counts[type];
        console.log(type);
        console.log(fish_list);
        const fish_type = type.includes("-") ? type.split("-")[0] : type;
        const fish_variant = type.includes("-") ? type.split("-")[1] : null;
        const fish_data = DATA.fish[fish_type];
        if (fish_data === undefined) {
          // item
          const item_data = DATA.items[fish_type];
          if (parseInt(amt) > fish_list.length) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = `You only have ${fish_list.length} of ${item_data.name}${v_text} in your inventory. `;
            await client.chat.postEphemeral({
              channel: body.channel.id,
              user: body.user.id,
              blocks: blocks,
            });
            return;
          }
          for (let i = 0; i < parseInt(amt); i++) {
            const item = fish_list.splice(0, 1)[0];
            sold.push({
              type: type,
              item: true,
              value: item.value,
              name: item_data.name,
              index: item.index,
            });
            total_profit += item.value;
          }
        } else {
          if (parseInt(amt) > fish_list.length) {
            const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
            blocks[0].text.text = `You only have ${fish_list.length} of ${fish_data.name}${v_text} in your inventory. `;
            await client.chat.postEphemeral({
              channel: body.channel.id,
              user: body.user.id,
              blocks: blocks,
            });
            return;
          }
          const v_text = fish_variant
            ? ` (${fish_variant.charAt(0).toUpperCase() + fish_variant.slice(1)})`
            : "";
          // first x amt of fish are sold -> so from the beginning of the list
          for (let i = 0; i < parseInt(amt); i++) {
            const fish = fish_list.splice(0, 1)[0];
            // console.log(fish);
            sold.push({
              type: type,
              weight: fish.weight,
              index: fish.index,
              name: fish_data.name + v_text,
              value: fish.value,
            });
            total_profit += fish.value;
          }
        }
        console.log(sold);
        console.log(total_profit);
      }
      const indexes_to_remove = sold.map((fish) => fish.index); // remove fish
      for (let i = user_data.inventory.length - 1; i >= 0; i--) {
        if (indexes_to_remove.includes(i)) {
          user_data.inventory.splice(i, 1);
        }
      }
      let coins = user.coins + total_profit;
      user_data.stats.total_fish_sold += sold.length;
      user_data.stats.total_amount_earned += total_profit;
      
      db.prepare("UPDATE users SET data = ?, coins = ? WHERE id = ?").run(
        JSON.stringify(user_data),
        coins,
        user.id,
      );
      const blocks = JSON.parse(JSON.stringify(DATA.blocks["inventory-sell"]));
      let r_text = "";
      for (const fish of sold) {
        if (fish.item) {
          r_text += `**${fish.name}**: \`${fish.value}\`\n`;
          continue;
        }
        r_text += `**${fish.name}**: \`${fish.weight} lbs\` - \`$${fish.value}\`\n`;
      }
      blocks[1].text = r_text;
      blocks[0].text.text = `${user.username} - Inventory Sell Results`;
      await client.chat.postEphemeral({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks,
      });
      const new_blocks = populateInventoryBlocks(user_data, DATA, {
        type: "none",
      });
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: new_blocks,
      });
    },
  },
};
