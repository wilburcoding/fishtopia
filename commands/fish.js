function populateStartBlocks(DATA, user, toolId, baitId, boatId, mapId) {
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-start"]));
  const userData = JSON.parse(user.data);
  let userEquipment = userData.equipment;
  let tool = userEquipment.find(
    (item) => item.id === toolId && item.etype === "tool",
  );
  let bait = userEquipment.find(
    (item) => item.id === baitId && item.etype === "bait",
  );
  let boat = userData.boats.find((item) => item.id === boatId);
  blocks[0].text.text = `${user.username} - Preparing to Fish`;
  // populate block with the selected stuff
  const boatData = DATA.boats[boat.type];
  blocks[2].elements[0].title.text = boatData.name;
  blocks[2].elements[0].subtitle.text = `Default Boat - ID: ${boat.id}`;
  blocks[2].elements[0].body.text = `
    ${boatData.description}
*Tier*: \`${boatData.tier}\`
*Speed*: \`${boatData.stats.speed}\`
*Sturdiness*: \`${boatData.stats.sturdiness}\`,
*Capacity*: \`${boatData.stats.capacity}\`
*Range*: \`${boatData.stats.range}\`
    `;

  const toolData = DATA.tools[tool.type];
  blocks[2].elements[1].title.text = toolData.name;
  blocks[2].elements[1].subtitle.text = `Selected Tool - ID: ${tool.id}`;
  blocks[2].elements[1].body.text = `
    ${toolData.description}
*Tier*: \`${toolData.tier}\`
*Durability*: \`${tool.durability}%\`
*Effects*: \`${Object.keys(toolData.effects).length}\`
    `;

  const baitData = DATA.baits[bait.type];
  blocks[2].elements[2].title.text = baitData.name;
  blocks[2].elements[2].subtitle.text = `Selected Bait - ID: ${bait.id}`;
  blocks[2].elements[2].body.text = `
    ${baitData.description}
*Tier*: \`${baitData.tier}\`
*Durability*: \`${bait.durability}%\`
*Effects*: \`${Object.keys(baitData.effects).length}\`
    `;

  // populate static select lists
  const tools = userEquipment.filter((item) => item.etype === "tool");
  blocks[3].element.options = tools.map((item) => {
    return {
      text: {
        type: "plain_text",
        text: `${DATA.tools[item.type].name} - (id: ${item.id})`,
        emoji: true,
      },
      value: item.id,
    };
  });
  blocks[3].element.initial_option = {
    text: {
      type: "plain_text",
      text: `${DATA.tools[tool.type].name} - (id: ${tool.id})`,
      emoji: true,
    },
    value: tool.id,
  };

  const baits = userEquipment.filter((item) => item.etype === "bait");
  blocks[4].element.options = baits.map((item) => {
    return {
      text: {
        type: "plain_text",
        text: `${DATA.baits[item.type].name} - (id: ${item.id})`,
        emoji: true,
      },
      value: item.id,
    };
  });
  blocks[4].element.initial_option = {
    text: {
      type: "plain_text",
      text: `${DATA.baits[bait.type].name} - (id: ${bait.id})`,
      emoji: true,
    },
    value: bait.id,
  };
  // maps
  blocks[6].element.options = Object.keys(DATA.maps).map((map) => {
    return {
      text: {
        type: "plain_text",
        text: `${DATA.maps[map].name}`,
        emoji: true,
      },
      value: map,
    };
  });
  blocks[6].element.initial_option = {
    text: {
      type: "plain_text",
      text: `${DATA.maps[mapId].name}`,
      emoji: true,
    },
    value: mapId,
  };

  // map card
  const mapData = DATA.maps[mapId];
  blocks[7].title.text = mapData.name;
  let fish_available = 0;
  for (let fish of Object.keys(DATA.fish)) {
    if (Object.keys(DATA.fish[fish]["maps"]).includes(mapId)) {
      4;
      fish_available++;
    }
  }
  // fish_available = fish_available.trim();
  blocks[7].body.text = `
${mapData.description}
*Danger* (Sturdiness): \`${mapData.danger}\` (Your boat: \`${boatData.stats.sturdiness}\`)
*Distance*: \`${mapData.distance}\` (Your boat range: \`${boatData.stats.range}\`)
*Fish Available*: ${fish_available}
    `;

  // add boat sturdiness warning + range warning
  let warning_text = "";
  if (boatData.stats.sturdiness < mapData.danger) {
    warning_text +=
      ":warning: Warning: Your boat may not be sturdy enough for this location.\n";
  } else {
    warning_text +=
      ":white_check_mark: Your boat is sturdy enough for this location. \n";
  }

  if (boatData.stats.range < mapData.distance) {
    warning_text +=
      ":warning: Warning: Your boat is out of range for this location. \n";
  } else {
    warning_text +=
      ":white_check_mark: Your boat is in range for this location. \n";
  }
  warning_text = warning_text.trim();
  blocks[8].text = warning_text;
  return blocks;
}

function calcTimeRemaining(timestamp) {
  const now = Date.now();
  const timeRemaining = timestamp - now;
  if (timeRemaining <= 0) {
    return "0s";
  }
  const seconds = Math.floor(timeRemaining / 1000) % 60;
  const minutes = Math.floor(timeRemaining / (60 * 1000)) % 60;
  const hours = Math.floor(timeRemaining / (60 * 60 * 1000)) % 24;
  if (hours > 0) {
    return `${hours} hours`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  }
  // keeping it simple
  return `${seconds} seconds`;
}
function populateTravelBlocks(DATA, user) {
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-travel"]));
  let user_state = JSON.parse(user.state);
  console.log(user_state);
  if (user_state.location === "home") {
    blocks[0].text.text = `${user.username} - Traveling Home`;
    blocks[1].title.text = `Destination: Home`;
    blocks[1].body.text = `Traveling back home!
*ETA*: ${calcTimeRemaining(user_state.time_reach)}`;
  } else {
    let map = user_state.location;
    const mapData = DATA.maps[map];
    blocks[0].text.text = `${user.username} - Traveling to ${mapData.name}`;
    blocks[1].title.text = `Destination: ${mapData.name}`;
    blocks[1].body.text = `
    ${mapData.description}
*ETA*: ${calcTimeRemaining(user_state.time_reach)}
    `;
  }
  return blocks;
}

function populatePreFishingBlocks(DATA, user, toolId, baitId, boatId, mapId) {
  const mapData = DATA.maps[mapId];
  const blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-prefish"]));
  blocks[0].text.text = `${user.username} - Fishing at ${mapData.name}`;
  blocks[1].text = `You've arrived at \`${mapData.name}\`! The tool, bait, and boat you selected are shown below. You can start fishing once you're ready!`;
  // populate cards with tool, bait, boat info
  const userData = JSON.parse(user.data);
  const equipment = userData.equipment;
  const tool = equipment.find(
    (item) => item.id === toolId && item.etype === "tool",
  );
  const bait = equipment.find(
    (item) => item.id === baitId && item.etype === "bait",
  );
  const boat = userData.boats.find((item) => item.id === boatId);

  // they shoudl all technically exist ^^
  const boatData = DATA.boats[boat.type];
  blocks[2].elements[0].title.text = boatData.name;
  blocks[2].elements[0].subtitle.text = `Boat - ID: ${boat.id}`;
  blocks[2].elements[0].body.text = `${boatData.description}`;

  const toolData = DATA.tools[tool.type];
  blocks[2].elements[1].title.text = toolData.name;
  blocks[2].elements[1].subtitle.text = `Tool - ID: ${tool.id}`;
  blocks[2].elements[1].body.text = `${toolData.description}`;

  const baitData = DATA.baits[bait.type];
  blocks[2].elements[2].title.text = baitData.name;
  blocks[2].elements[2].subtitle.text = `Bait - ID: ${bait.id}`;
  blocks[2].elements[2].body.text = `${baitData.description}`;
  return blocks;
}
function populateFishingWaitBlocks(DATA, user, toolId, baitId, boatId, mapId) {
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-waitfish"]));
  const mapData = DATA.maps[mapId];
  const userData = JSON.parse(user.data);
  const equipment = userData.equipment;
  const tool = equipment.find(
    (item) => item.id === toolId && item.etype === "tool",
  );
  const bait = equipment.find(
    (item) => item.id === baitId && item.etype === "bait",
  );
  const boat = userData.boats.find((item) => item.id === boatId);
  const boatData = DATA.boats[boat.type];
  const toolData = DATA.tools[tool.type];
  const baitData = DATA.baits[bait.type];
  const txt = `You're at \`${mapData.name}\` with a \`${boatData.name}\`, using a \`${toolData.name}\` and \`${baitData.name}\``;
  blocks[0].title.text = `${user.username} - Line Casted`;
  blocks[0].subtext.text = txt;
  return blocks;
}

function populateFishingResultsBlocks(
  DATA,
  user,
  toolId,
  baitId,
  boatId,
  mapId,
) {
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-postfish"]));
  let userState = JSON.parse(user.state);
  const results = userState.results;
  let equipment = JSON.parse(user.data).equipment;
  let tool = equipment.find(
    (item) => item.id === toolId && item.etype === "tool",
  );
  let bait = equipment.find(
    (item) => item.id === baitId && item.etype === "bait",
  );
  let boat = JSON.parse(user.data).boats.find((item) => item.id === boatId);
  let mapData = DATA.maps[mapId];
  let toolData = DATA.tools[tool.type];
  let baitData = DATA.baits[bait.type];
  let boatData = DATA.boats[boat.type];
  let storageMessage = `Your boat storage is at \`${userState.storage.length}/${boatData.stats.capacity}\`.`;
  if (userState.storage.length == boatData.stats.capacity) {
    storageMessage = ":warning: Your boat storage is full!";
  }
  blocks[0].text.text = `${user.username} - Fishing Results`;
  blocks[1].text = `You fished at \`${mapData.name}\` with a \`${boatData.name}\`, using a \`${toolData.name}\` and \`${baitData.name}\`. \nYou caught a total of \`${results.length}\` fish! ${storageMessage}`;
  blocks[2].elements = results.map((fish) => {
    let fishData = DATA.fish[fish.type];
    let variantText = fish.variant
      ? `- ${String(fish.variant).slice(0, 1).toUpperCase() + String(fish.variant).slice(1)}`
      : "";
    let vtext = fish.variant
      ? String(fish.variant).slice(0, 1).toUpperCase() +
        String(fish.variant).slice(1)
      : "Normal";
    return {
      type: "card",
      title: {
        type: "mrkdwn",
        text: `${fishData.name}`,
        verbatim: false,
      },
      subtitle: {
        type: "mrkdwn",
        text: `${fishData.rarity} Fish ${variantText}`,
      },
      body: {
        type: "mrkdwn",
        text: `*Weight*: \`${fish.weight} lbs\`\n*Variant*: \`${vtext}\`\n*Sell Value*: \`${fish.value} coins\``,
      },
      actions: [],
    };
  });
  return blocks;
}

function catchFish(DATA, tool_data, bait_data, mapId) {
  let catch_nothing_chance = 0.25; // base 20% chance to catch nothing
  let catch_nothing_multiplier = 1;

  if (tool_data.effects.catch_nothing) {
    catch_nothing_multiplier -= tool_data.effects.catch_nothing;
  }
  if (bait_data.effects.catch_nothing) {
    catch_nothing_multiplier -= bait_data.effects.catch_nothing;
  }
  catch_nothing_chance *= catch_nothing_multiplier;

  // base rarity probs
  let rarity_probs = {
    common: 0.5,
    uncommon: 0.27,
    rare: 0.16,
    epic: 0.05,
    legendary: 0.02,
  };

  let variant_probs = {
    shiny: 0.02,
    chroma: 0.005,
  };

  for (let rarity of Object.keys(rarity_probs)) {
    let rarity_multiplier = 1;
    if (tool_data.effects[`${rarity}_multiplier`]) {
      rarity_multiplier += tool_data.effects[`${rarity}_multiplier`];
    }
    if (bait_data.effects[`${rarity}_multiplier`]) {
      rarity_multiplier += bait_data.effects[`${rarity}_multiplier`];
    }
    rarity_probs[rarity] *= rarity_multiplier;
  }
  for (let variant of Object.keys(variant_probs)) {
    let variant_multiplier = 1;
    if (tool_data.effects[`${variant}_multiplier`]) {
      variant_multiplier += tool_data.effects[`${variant}_multiplier`];
    }
    if (bait_data.effects[`${variant}_multiplier`]) {
      variant_multiplier += bait_data.effects[`${variant}_multiplier`];
    }
    variant_probs[variant] *= variant_multiplier;
  }

  let fish_catch = null;
  let variant = null;

  // first check if catch nothing
  if (Math.random() < catch_nothing_chance) {
    fish_catch = null;
  } else {
    // determine rarity
    let rarity_total = 0; // need to normalize
    for (let rarity of Object.keys(rarity_probs)) {
      rarity_total += rarity_probs[rarity];
    }
    let rarity_roll = Math.random() * rarity_total;
    let rarity = "common";
    let cumulative = 0;
    for (let r of Object.keys(rarity_probs)) {
      cumulative += rarity_probs[r];
      if (rarity_roll < cumulative) {
        rarity = r;
        break;
      }
    }

    // variants
    let variant_roll = Math.random();
    let cumulative_variant = 0;
    for (let v of Object.keys(variant_probs)) {
      cumulative_variant += variant_probs[v];
      if (variant_roll < cumulative_variant) {
        variant = v;
        break;
      }
    }
  }
  // get fish now
  let fish_available = {};
  for (let fish of Object.keys(DATA.fish)) {
    if (Object.keys(DATA.fish[fish]["maps"]).includes(mapId)) {
      fish_available[fish] = DATA.fish[fish]["maps"][mapId];
    }
  }
  let fish_total = 0;
  for (let fish of Object.keys(fish_available)) {
    fish_total += fish_available[fish];
  }
  const fish_roll = Math.random() * fish_total;
  let cumulative_fish = 0;
  for (let fish of Object.keys(fish_available)) {
    cumulative_fish += fish_available[fish];
    if (fish_roll < cumulative_fish) {
      fish_catch = fish;
      break;
    }
  }
  let weight_multi = 1;
  if (tool_data.effects.weight) {
    weight_multi *= tool_data.effects.weight;
  }
  if (bait_data.effects.weight) {
    weight_multi *= bait_data.effects.weight;
  }
  let fish_data = DATA.fish[fish_catch];

  let weight =
    Math.random() * (fish_data.weight["max"] - fish_data.weight["min"]) +
    fish_data.weight["min"];
  weight *= weight_multi;
  weight = Math.round(weight * 100) / 100;
  console.log(`Rarity probs: ${JSON.stringify(rarity_probs)}`);
  console.log(`Variant probs: ${JSON.stringify(variant_probs)}`);
  // console.log(`Catch time: ${catch_time}`);
  console.log(`Catch nothing chance: ${catch_nothing_chance}`);
  let value = fish_data.sell_value;
  let mean_weight = (fish_data.weight["max"] + fish_data.weight["min"]) / 2;
  let value_multi = weight / mean_weight;
  let fish_value = Math.round(value * value_multi);
  return {
    type: fish_catch,
    variant: variant,
    value: fish_value,
    weight: weight,
  };
}

function catchTime(tool_data, bait_data) {
  let catch_time = Math.floor(Math.random() * 4) + 6; // default time
  if (tool_data.effects.catch_speed) {
    catch_time -=
      Math.floor(
        Math.random() *
          Math.abs(
            tool_data.effects.catch_speed[1] - tool_data.effects.catch_speed[0],
          ),
      ) + tool_data.effects.catch_speed[0];
  }
  if (bait_data.effects.catch_speed) {
    catch_time -=
      Math.floor(
        Math.random() *
          Math.abs(
            bait_data.effects.catch_speed[1] - bait_data.effects.catch_speed[0],
          ),
      ) + bait_data.effects.catch_speed[0];
  }
  if (catch_time < 0) {
    catch_time = 0;
  }
  return catch_time;
}

module.exports = {
  name: "/f-fish",
  description: "Go fishing!",
  execute: async ({ command, ack, respond, client }) => {
    await ack();
    const DATA = global.data;
    const db = global.db;

    const user = db
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
    let equipment = userData.equipment;
    let toolId = null;
    let baitId = null;
    let boatId = null;
    let mapId = null;
    const state = JSON.parse(user.state);
    console.log(state);
    if (state.current === "idle") {
      // automatically select the best tool and bait
      let tools = equipment.filter((item) => item.etype === "tool");
      tools.sort((a, b) => b.tier - a.tier);
      if (tools.length > 0) {
        toolId = tools[0].id;
      }

      let baits = equipment.filter((item) => item.etype === "bait");
      baits.sort((a, b) => b.tier - a.tier);
      if (baits.length > 0) {
        baitId = baits[0].id;
      }

      let boats = userData.boats;
      // find default boat -> should always exist
      let defaultBoat = boats.find((boat) => boat.default);
      if (defaultBoat) {
        boatId = defaultBoat.id;
      }

      // find best map boat can go to (based on sturdiness)
      for (let map of Object.keys(DATA.maps)) {
        // console.log(map);
        // console.log(DATA.maps[map].danger);
        // console.log(DATA.boats[defaultBoat.type].stats.sturdiness);
        if (
          DATA.maps[map].danger <= DATA.boats[defaultBoat.type].stats.sturdiness
        ) {
          console.log(map);
          mapId = map;
        }
      }
      console.log("map Id")
      console.log(mapId);

      // console.log(toolId);
      // console.log(baitId);
      // console.log(boatId);
      const blocks = populateStartBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );

      // just testing layout as I go
      // const blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-start"]));

      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
        metadata: {
          event_type: "fish_start",
          event_payload: {
            toolId: toolId,
            baitId: baitId,
            boatId: boatId,
            userId: user.id,
            mapId: mapId,
          },
        },
      });
    } else if (state.current === "traveling") {
      if (state.time_reach <= Date.now()) {
        // reached place -> change to fishing UI
        if (state.location === "home") {
          const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
          blocks[0].text.text = "Congrats! You have returned home from your trip. ";
          state.current = "idle";
          state.location = "home";
          state.metadata = {};
          state.time_reach = 0;
          db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
            JSON.stringify(state),
            user.id
          );
          await client.chat.postEphemeral({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks
          });
          return;
        }
        state.current = "prefish";
        db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
          JSON.stringify(state),
          user.id,
        );
        const metadata = state.metadata;
        toolId = metadata.toolId;
        baitId = metadata.baitId;
        boatId = metadata.boatId;
        mapId = state.location;
        const blocks = populatePreFishingBlocks(
          DATA,
          user,
          toolId,
          baitId,
          boatId,
          mapId,
        );
        await client.chat.postMessage({
          channel: command.channel_id,
          user: command.user_id,
          blocks: blocks,
        });
        return;
      }
      const blocks = populateTravelBlocks(DATA, user);
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
      // so it turns out no metadata is needed for this since you can't really go on anyways
    } else if (state.current === "prefish") {
      const metadata = state.metadata;
      toolId = metadata.toolId;
      baitId = metadata.baitId;
      boatId = metadata.boatId;
      mapId = state.location;
      const blocks = populatePreFishingBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
    } else if (state.current === "casting") {
      const metadata = state.metadata;
      toolId = metadata.toolId;
      baitId = metadata.baitId;
      boatId = metadata.boatId;
      mapId = state.location;
      const blocks = populateFishingWaitBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
      // show warning
      const blocks2 = JSON.parse(JSON.stringify(DATA.blocks["error"]));
      blocks2[0].text.text =
        "You are already current casting your line. The /f-fish command message where you casted will be the only one that updates with your catch. ";
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks2,
      });
    } else if (state.current === "results") {
      const metadata = state.metadata;
      toolId = metadata.toolId;
      baitId = metadata.baitId;
      boatId = metadata.boatId;
      mapId = state.location;
      const blocks = populateFishingResultsBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks,
      });
    }
  },
  actions: {
    pregame_tool_select: async ({ action, ack, client, body, respond }) => {
      await ack();
      const new_tool_id = action.selected_option.value;
      const metadata = body.message.metadata;
      const baitId = metadata.event_payload.baitId;
      const boatId = metadata.event_payload.boatId;
      const userId = metadata.event_payload.userId;
      const DATA = global.data;
      const db = global.db;

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

      const blocks = populateStartBlocks(
        DATA,
        user,
        new_tool_id,
        baitId,
        boatId,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        user: body.user.id,
        blocks: blocks,
        metadata: {
          event_type: "fish_start",
          event_payload: {
            userId: user.id,
            toolId: new_tool_id,
            baitId: baitId,
            boatId: boatId,
          },
        },
      });
    },
    pregame_bait_select: async ({ action, ack, client, body, respond }) => {
      await ack();
      const new_bait_id = action.selected_option.value;
      const metadata = body.message.metadata;
      const toolId = metadata.event_payload.toolId;
      const boatId = metadata.event_payload.boatId;
      const userId = metadata.event_payload.userId;
      const DATA = global.data;
      const db = global.db;

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

      const blocks = populateStartBlocks(
        DATA,
        user,
        toolId,
        new_bait_id,
        boatId,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        user: body.user.id,
        blocks: blocks,
        metadata: {
          event_type: "fish_start",
          event_payload: {
            userId: user.id,
            toolId: toolId,
            baitId: new_bait_id,
            boatId: boatId,
          },
        },
      });
    },
    pregame_location_select: async ({ action, ack, client, body, respond }) => {
      await ack();
      const new_map_id = action.selected_option.value;
      const metadata = body.message.metadata;
      const toolId = metadata.event_payload.toolId;
      const baitId = metadata.event_payload.baitId;
      const boatId = metadata.event_payload.boatId;

      const userId = metadata.event_payload.userId;
      const DATA = global.data;
      const db = global.db;

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

      const blocks = populateStartBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        new_map_id,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        user: body.user.id,
        blocks: blocks,
        metadata: {
          event_type: "fish_start",
          event_payload: {
            userId: user.id,
            toolId: toolId,
            baitId: baitId,
            boatId: boatId,
            mapId: new_map_id,
          },
        },
      });
    },
    pregame_start: async ({ action, ack, client, body, respond }) => {
      await ack();
      const metadata = body.message.metadata;
      const toolId = metadata.event_payload.toolId;
      const baitId = metadata.event_payload.baitId;
      const boatId = metadata.event_payload.boatId;
      // boat, tool, and bait info is passed through metadata. Map is in state data so its not going with metadata
      const mapId = metadata.event_payload.mapId;

      const userId = metadata.event_payload.userId;
      const DATA = global.data;
      const db = global.db;
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

      // start traveling
      userState = JSON.parse(user.state);
      if (userState.current !== "idle") {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "You are already on a trip. You cannot start a new one until you return from your current trip. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      userState.current = "traveling";
      userState.location = mapId;
      userState.metadata = {
        toolId: toolId,
        baitId: baitId,
        boatId: boatId,
      };
      // time to reach = distance / speed (minutes)
      const user_data = JSON.parse(user.data);
      const boats = user_data.boats;
      const boat = boats.find((b) => b.id === boatId);

      let time_to_reach = Math.ceil(
        DATA.maps[mapId].distance / DATA.boats[boat.type].stats.speed,
      );


      // TESTING ONLY
      time_to_reach = 1/60; 
      const time_reach = Date.now() + time_to_reach * 60 * 1000;
      userState.time_reach = time_reach;

      // const blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-travel"]));
      db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
        JSON.stringify(userState),
        userId,
      );
      user.state = JSON.stringify(userState);
      const blocks = populateTravelBlocks(DATA, user);
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
        // metadata: {
        //   event_type: "fish_travel",
        //   event_payload: {
        //     userId: user.id,
        //     toolId: toolId,
        //     baitId: baitId,
        //     boatId: boatId,
        //     mapId: mapId,
        //   },
        // }, No metadata needed see explanation above
      });
    },
    fish_rstart: async ({ action, ack, client, body, respond }) => {
      // cast line -> showing pre catch and then catch screen with delay
      await ack();
      const userId = body.user.id;
      const DATA = global.data;
      const db = global.db;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        // theoretically shouldn't happen ig
        blocks[0].text.text =
          "Somehow, the user doesn't exist. Please try getting started with the /f-start command. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userState = JSON.parse(user.state);
      if (userState.current !== "prefish") {
        // should be super uncommon
        const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "You are not currently preparing to fish. Please use the /f-fish command again. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      userState.current = "casting";
      userState.storage = []; // to put all fish caught already. Make sure to cap at boat capacity
      const toolId = userState.metadata.toolId;
      const baitId = userState.metadata.baitId;
      const boatId = userState.metadata.boatId;
      const mapId = userState.location;
      const userData = JSON.parse(user.data);
      db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
        JSON.stringify(userState),
        userId,
      );
      const blocks = populateFishingWaitBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
      });
      const tool = userData.equipment.find(
        (item) => item.id === toolId && item.etype === "tool",
      );
      const bait = userData.equipment.find(
        (item) => item.id === baitId && item.etype === "bait",
      );
      const tool_data = DATA.tools[tool.type];
      const bait_data = DATA.baits[bait.type];
      const boat = userData.boats.find((item) => item.id === boatId);

      let catch_time = catchTime(tool_data, bait_data);
      let catch_amt = 1; // default 1 fish
      if (tool_data.effects.catch_amt) {
        catch_amt +=
          Math.floor(
            Math.random() *
              (tool_data.effects.catch_count[1] -
                tool_data.effects.catch_count[0]),
          ) + tool_data.effects.catch_count[0];
      }
      if (bait_data.effects.catch_amt) {
        catch_amt +=
          Math.floor(
            Math.random() *
              (bait_data.effects.catch_count[1] -
                bait_data.effects.catch_count[0]),
          ) + bait_data.effects.catch_count[0];
      }
      catch_amt = Math.min(6, catch_amt); // hard ceiling for fish amt
      if (
        catch_amt + userState.storage.length >
        DATA.boats[boat.type].stats.capacity
      ) {
        catch_amt =
          DATA.boats[boat.type].stats.capacity - userState.storage.length;
      }
      let fish_caught = [];
      for (let i = 0; i < catch_amt; i++) {
        fish_caught.push(catchFish(DATA, tool_data, bait_data, mapId));
      }
      console.log(fish_caught);

      setTimeout(async () => {
        // update message with catch results
        userState.current = "results";
        userState.results = fish_caught;
        db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
          JSON.stringify(userState),
          userId,
        );
        user.state = JSON.stringify(userState);
        const blocks = populateFishingResultsBlocks(
          DATA,
          user,
          toolId,
          baitId,
          boatId,
          mapId,
        );
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
        });
      }, catch_time * 1000);
    },
    fish_rcast: async ({ action, ack, client, body, respond }) => {
      await ack();
      const userId = body.user.id;
      const DATA = global.data;
      const db = global.db;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Somehow, this user doesn't exist. Please try getting started with the /f-start command.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userState = JSON.parse(user.state);
      if (userState.current !== "results") {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It dosen't look like you are ready to do this action. Please use the /f-fish command again. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      const userData = JSON.parse(user.data);
      const metadata = userState.metadata;
      const toolId = metadata.toolId;
      const baitId = metadata.baitId;
      const boatId = metadata.boatId;
      const mapId = userState.location;
      const boat = userData.boats.find((item) => item.id === boatId);
      if (userState.storage.length == boat.stats.capacity) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Your storage is full, you can't continue fishing. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      userState.current = "casting";
      // for (let fish of userState.results) {
      //   userState.storage.push(fish);
      // }
      userState.results = [];

      db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
        JSON.stringify(userState),
        userId,
      );
      const blocks = populateFishingWaitBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
      });
      const tool = userData.equipment.find(
        (item) => item.id === toolId && item.etype === "tool",
      );
      const bait = userData.equipment.find(
        (item) => item.id === baitId && item.etype === "bait",
      );
      const tool_data = DATA.tools[tool.type];
      const bait_data = DATA.baits[bait.type];

      let catch_time = catchTime(tool_data, bait_data);

      let catch_amt = 1; // default
      if (tool_data.effects.catch_amt) {
        catch_amt +=
          Math.floor(
            Math.random() *
              (tool_data.effects.catch_count[1] -
                tool_data.effects.catch_count[0]),
          ) + tool_data.effects.catch_count[0];
      }
      if (bait_data.effects.catch_amt) {
        catch_amt +=
          Math.floor(
            Math.random() *
              (bait_data.effects.catch_count[1] -
                bait_data.effects.catch_count[0]),
          ) + bait_data.effects.catch_count[0];
      }
      catch_amt = Math.min(6, catch_amt); // hard ceiling
      if (
        catch_amt + userState.storage.length >
        DATA.boats[boat.type].stats.capacity
      ) {
        catch_amt =
          DATA.boats[boat.type].stats.capacity - userState.storage.length;
      }
      let fish_caught = [];
      for (let i = 0; i < catch_amt; i++) {
        fish_caught.push(catchFish(DATA, tool_data, bait_data, mapId));
      }
      console.log(fish_caught);
      setTimeout(async () => {
        // update message with catch results
        userState.current = "results";
        userState.results = fish_caught;
        db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
          JSON.stringify(userState),
          userId,
        );
        user.state = JSON.stringify(userState);
        const blocks = populateFishingResultsBlocks(
          DATA,
          user,
          toolId,
          baitId,
          boatId,
          mapId,
        );
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
        });
      }, catch_time * 1000);
    },
    fish_kcast: async ({ action, ack, client, body, respond }) => {
      await ack();
      const userId = body.user.id;
      const DATA = global.data;
      const db = global.db;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Somehow, this user doesn't exist. Please try getting started with the /f-start command.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userState = JSON.parse(user.state);
      if (userState.current !== "results") {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It dosen't look like you are ready to do this action. Please use the /f-fish command again";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userData = JSON.parse(user.data);
      const metadata = userState.metadata;
      const toolId = metadata.toolId;
      const baitId = metadata.baitId;
      const boatId = metadata.boatId;
      const mapId = userState.location;
      const boat = userData.boats.find((item) => item.id === boatId);

      if (userState.storage.length == boat.stats.capacity) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Your storage is full, you can't continue fishing. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      userState.current = "casting";

      for (let fish of userState.results) {
        userState.storage.push(fish);
      }
      userState.results = [];

      db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
        JSON.stringify(userState),
        userId,
      );
      const blocks = populateFishingWaitBlocks(
        DATA,
        user,
        toolId,
        baitId,
        boatId,
        mapId,
      );
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
      });
      const tool = userData.equipment.find(
        (item) => item.id === toolId && item.etype === "tool",
      );
      const bait = userData.equipment.find(
        (item) => item.id === baitId && item.etype === "bait",
      );
      const tool_data = DATA.tools[tool.type];
      const bait_data = DATA.baits[bait.type];

      let catch_time = catchTime(tool_data, bait_data);
      let catch_amt = 1; // default catch amt
      if (tool_data.effects.catch_amt) {
        catch_amt += Math.floor(
          Math.random() *
            (tool_data.effects.catch_count[1] -
              tool_data.effects.catch_count[0]) +
            tool_data.effects.catch_count[0],
        );
      }
      if (bait_data.effects.catch_amt) {
        catch_amt += Math.floor(
          Math.random() *
            (bait_data.effects.catch_count[1] -
              bait_data.effects.catch_count[0]) +
            bait_data.effects.catch_count[0],
        );
      }
      catch_amt = Math.min(6, catch_amt); // catch amt ceiling
      if (
        catch_amt + userState.storage.length >
        DATA.boats[boat.type].stats.capacity
      ) {
        catch_amt =
          DATA.boats[boat.type].stats.capacity - userState.storage.length;
      }
      let fish_caught = [];
      for (let i = 0; i < catch_amt; i++) {
        fish_caught.push(catchFish(DATA, tool_data, bait_data, mapId));
      }

      console.log(fish_caught); // will prob keep this in for debugging
      setTimeout(async () => {
        userState.current = "results";
        userState.results = fish_caught;
        db.prepare("UPDATE users SET state = ? WHERE id = ?").run(
          JSON.stringify(userState),
          userId,
        );
        user.state = JSON.stringify(userState);
        const blocks = populateFishingResultsBlocks(
          DATA,
          user,
          toolId,
          baitId,
          boatId,
          mapId,
        );
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks,
        });
      }, catch_time * 1000);
    },
    fish_storage: async ({ action, ack, client, body, respond }) => {
      // dismissable ephemeral message with list of all fish in storage
      await ack();
      const userId = body.user.id;
      const DATA = global.data;
      const db = global.db;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Somehow, this user doesn't exist. Please try getting started with the /f-start command.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userState = JSON.parse(user.state);
      const storage = userState.storage;
      console.log(storage);
      let fish_counts = {};
      for (let fish of storage) {
        if (fish_counts[fish.type]) {
          fish_counts[fish.type] += 1;
        } else {
          fish_counts[fish.type] = 1;
        }
      }
      let blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${user.username}'s Fish Storage`,
          },
          level: 1,
        },
      ]; // this one is ismple so no custom blocks are needed
      let txt = "";
      for (let fish_type of Object.keys(fish_counts)) {
        txt += `**${fish_counts[fish_type]}x** ${DATA.fish[fish_type].name} (${DATA.fish[fish_type].rarity})\n`;
      }
      if (txt === "") {
        txt = "You have no fish in your storage.";
      }
      blocks.push({
        type: "markdown",
        text: txt,
      });
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Dismiss",
              emoji: true,
            },
            value: "dismiss",
            action_id: "dismiss",
          },
        ],
      });
      await client.chat.postEphemeral({
        channel: body.channel.id,
        user: body.user.id,
        blocks: blocks,
      });
      //
    },
    fish_endtrip: async ({ action, ack, client, body, respond }) => {
      // set state, set time return, store in metadata
      await ack();
      const userId = body.user.id;
      const DATA = global.data;
      const db = global.db;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "Somehow, this user doesn't exist. Please try getting started with the /f-start command.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }
      const userState = JSON.parse(user.state);
      if (userState.current !== "results") {
        let blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
        blocks[0].text.text =
          "It dosen't look like you are ready to do this action. Please use the /f-fish comamnd again. ";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      }

      // put fish into inventory
      let userData = JSON.parse(user.data);
      let inventory = userData.inventory;
      for (let fish of userState.storage) {
        inventory.push(fish);
      }
      const mapId = userState.location;
      userData.inventory = inventory;
      userState.storage = [];
      userState.current = "traveling";
      userState.location = "home";
      const boat = userData.boats.find(
        (item) => item.id === userState.metadata.boatId,
      );
      const time_to_reach = Math.ceil(
        DATA.maps[mapId].distance / DATA.boats[boat.type].stats.speed,
      );
      const time_reach = Date.now() + time_to_reach * 60 * 1000;
      userState.time_reach = time_reach;

      // TODO: update stats
      db.prepare("UPDATE users SET data = ?, state = ? WHERE id = ?").run(
        JSON.stringify(userData),
        JSON.stringify(userState),
        userId,
      );
      user.state = JSON.stringify(userState);
      const blocks = populateTravelBlocks(DATA, user);
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        blocks: blocks,
      });
    },
  },
};
