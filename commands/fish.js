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
  let map = user_state.location;
  const mapData = DATA.maps[map];
  blocks[0].text.text = `${user.username} - Traveling to ${mapData.name}`;
  blocks[1].title.text = `Destination: ${mapData.name}`;
  blocks[1].body.text = `
    ${mapData.description}
*ETA*: ${calcTimeRemaining(user_state.time_reach)}
    `;
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
  const tool = equipment.find((item) => item.id === toolId && item.etype === "tool");
  const bait = equipment.find((item) => item.id === baitId && item.etype === "bait");
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
  let blocks = JSON.parse(JSON.stringify(DATA.blocks["fish-wait"]));
  const mapData = DATA.maps[mapId];
  const userData = JSON.parse(user.data);
  const equipment = userData.equipment;
  const tool = equipment.find((item) => item.id === toolId && item.etype === "tool");
  const bait = equipment.find((item) => item.id === baitId && item.etype === "bait");
  const boat = userData.boats.find((item) => item.id === boatId);
  const boatData = DATA.boats[boat.type];
  const toolData = DATA.tools[tool.type];
  const baitData = DATA.baits[bait.type];
  const txt = `You're at \`${mapData.name}\` with a \`${boatData.name}\`, using a \`${toolData.name}\` and \`${baitData.name}\``;
  blocks[0].title.text = `${user.username} - Line Casted`;
  blocks[0].subtext.text = txt;
  return blocks;

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
    console.log(state.current);
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
        const blocks = populatePreFishingBlocks(DATA, user, toolId, baitId, boatId, mapId);
        await client.chat.postMessage({
          channel: command.channel_id,
          user: command.user_id,
          blocks: blocks
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
      const blocks = populatePreFishingBlocks(DATA, user, toolId, baitId, boatId, mapId);
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks
      });
    } else if (state.current === "casting") {
      const metadata = state.metadata;
      toolId = metadata.toolId;
      baitId = metadata.baitId;
      boatId = metadata.boatId;
      mapId = state.location;
      const blocks = populateFishingWaitBlocks(DATA, user, toolId, baitId, boatId, mapId);
      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        blocks: blocks
      });
      // show warning
      
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

      const time_to_reach = Math.ceil(
        DATA.maps[mapId].distance / DATA.boats[boat.type].stats.speed,
      );
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
    fish_rstart:async ({ action, ack, client, body, respond}) => {
        // cast line -> showing pre catch and then catch screen with delay
        await ack();
        const userId = body.user.id;
        const DATA = global.data;
        const db = global.db;
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        if (!user) {
          const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
          // theoretically shouldn't happen ig
          blocks[0].text.text = "Somehow, the user doesn't exist. Please try getting started with the /f-start command. ";
          await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks
          });
          return;
        }
        const userState = JSON.parse(user.state);
        if (userState.current !== "prefish") {
          // should be super uncommon
          const blocks = JSON.parse(JSON.stringify(DATA.blocks["error"]));
          blocks[0].text.text = "You are not currently preparing to fish. Please use the /f-fish command again. ";
          await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks
          });
          return;
        }
        userState.current = "casting";
        const toolId = userState.metadata.toolId;
        const baitId = userState.metadata.baitId;
        const boatId = userState.metadata.boatId;
        const mapId = userState.location;
        db.prepare("UPDATE users SET state = ? WHERE id = ?").run(JSON.stringify(userState), userId);
        const blocks = populateFishingWaitBlocks(DATA, user, toolId, baitId, boatId, mapId);
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          blocks: blocks
        });

    }
  },
};
