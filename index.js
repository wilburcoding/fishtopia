const { App } = require("@slack/bolt");
const database = require("./database");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let DATA = null;
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// app.message(async ({ message }) => {
//     console.log("Any message received:", message.text);
// });

// load commands from /commands folder
const commandsPath = path.join(__dirname, "commands");
const commands = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commands) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (
    command.name &&
    command.description &&
    command.execute &&
    command.actions
  ) {
    app.command(command.name, command.execute);
    for (const actionName of Object.keys(command.actions)) {
      app.action(actionName, command.actions[actionName]);
    }
    console.log(`Command loaded: ${command.name}`);
  } else {
    console.error(`Invalid command file: ${file}`);
  }
}

function generateID(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// // test ping button action for ping command
function setData(username, data, coins, gold, level, xp, state) {
  const db = global.db;
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (user) {
    if (data === undefined) {
      data = user.data;
    }
    if (coins === undefined) {
      coins = user.coins;
    }
    if (gold === undefined) {
      gold = user.gold;
    }
    if (level === undefined) {
      level = user.level;
    }
    if (xp === undefined) {
      xp = user.xp;
    }

    if (state === undefined) {
      state = user.state;
    }
    console.log(state);
    db.prepare(
      "UPDATE users SET data = ?, coins = ?, gold = ?, level = ?, xp = ?, state = ? WHERE username = ?",
    ).run(data, coins, gold, level, xp, state, username);
    console.log("Successfully updated data for user: " + username);
  } else {
    console.error(`User with username ${username} not found.`);
  }
}

function getData(username) {
  const db = global.db;
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (user) {
    return {
      data: user.data,
      coins: user.coins,
      gold: user.gold,
      level: user.level,
      xp: user.xp,
      state: user.state,
    };
  } else {
    console.error(`User with username ${username} not found.`);
    return null;
  }
}
function resetData(username) {
  const db = global.db;
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (user) {
    const startingBoats = [
      {
        id: global.generateID(4),
        type: "kayak",
        addons: ["Upgraded Engine"],
        durability: 100,
        default: true,
        stats: {
          trips: 1,
          distance: 1,
          fish: 1,
        },
      },
      {
        id: global.generateID(4),
        type: "rowboat",
        addons: ["Upgraded Engine"],
        durability: 100,
        default: false,
        stats: {
          trips: 2,
          distance: 10,
          fish: 5,
        },
      },
    ];
    const stats = {
      total_fish_caught: 0,
      total_fish_sold: 0,
      total_fish_value: 0,
      total_amount_earned: 0,
      total_fish_released: 0,
      total_trades: 0,
      total_shop_purchases: 0,
      total_commands_used: 0,
      total_xp_earned: 0,
      total_equipment_used: 0,
      total_boats_used: 0,
      total_baits_used: 0,
    };
    const equipment = [
      {
        id: global.generateID(4),
        type: "fishing_rod",
        durability: 100,
        usage_stats: {
          trips: 1,
          fish_caught: 4,
          fish_weight: 20,
          fish_value: 100,
        },
        etype: "tool",
      },
      {
        id: global.generateID(4),
        type: "pole",
        durability: 100,
        usage_stats: {
          trips: 5,
          fish_caught: 10,
          fish_weight: 50,
          fish_value: 200,
        },
        etype: "tool",
      },
      {
        id: global.generateID(4),
        type: "ultimate",
        durability: 100,
        usage_stats: {
          trips: 1,
          fish_caught: 20,
          fish_weight: 100,
          fish_value: 500,
        },
        etype: "bait",
      },
      {
        id: global.generateID(4),
        type: "jumbo",
        durability: 100,
        usage_stats: {
          trips: 3,
          fish_caught: 25,
          fish_weight: 150,
          fish_value: 700,
        },
        etype: "bait",
      },
    ];
    const completion = {};
    for (let map of Object.keys(DATA.maps)) {
      completion[map] = {};
      for (let fish of Object.keys(DATA.fish)) {
        if (Object.keys(DATA.fish[fish]["maps"]).includes(map)) {
          completion[map][fish] = false;
        }
      }
    }
    db.prepare(
      "UPDATE users SET data = ?, coins = 1000, gold = 100, level = 1, xp = 0, state = ? WHERE username = ?",
    ).run(
      JSON.stringify({
        inventory: [],
        boats: startingBoats,
        equipment: equipment,
        stats: stats,
        completion: completion,
      }),
      JSON.stringify({
        current: "idle",
        location: "home",
        time_reach: 0,
        metadata: {},
      }),
      username,
    );
    // const new_data = db
    //   .prepare("SELECT * FROM users WHERE username = ?")
    //   .get(username);
    // console.log(new_data);
    console.log("Successfully reset data for user: " + username);
  } else {
    console.error(`User with username ${username} not found. `);
  }
}

(async () => {
  const { default: data } = await import("./data.json", {
    with: { type: "json" },
  });
  DATA = data;
  // database.clear(); // full clear (all data)
  database.setup();

  global.db = database.db;
  global.generateID = generateID;
  global.data = DATA;
  // resetData("jellyfish"); // reset data for testing only

  // let userdata = getData("jellyfish");

  // userdata = JSON.parse(userdata.data);
  // console.log(userdata.boats);
  // userdata.boats.push({
  //   id: global.generateID(4),
  //   type: "trawler",
  //   addons: ["Upgraded Engine"],
  //   durability: 100,
  //   default: false,
  //   stats: { trips: 1, distance: 1, fish: 1}
  // });

  // // userdata.boats = [];
  // // console.log(userdata.boats);
  // setData(
  //   "jellyfish",
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   JSON.stringify({
  //     current: "idle", // alternative options: traveling, fishing
  //     location: "home", // alternative options: any map id
  //     time_reach: 0, // when applicable -> for the time when user is reaching a new location
  //     metadata: {}, // extra data to store (ex. boat, tool, bait IDs )
  //   }),
  // ); // for testing only

  await app.start(process.env.PORT || 3000);
  console.log("App is running on port", process.env.PORT || 3000);
})();
