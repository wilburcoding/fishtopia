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
function setData(username, data, coins, gold, level, xp) {
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
    db.prepare(
      "UPDATE users SET data = ?, coins = ?, gold = ?, level = ?, xp = ? WHERE username = ?",
    ).run(data, coins, gold, level, xp, username);
    console.log("Successfully updated data for user: " + username);
  } else {
    console.error(`User with username ${username} not found.`);
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
  setData("jellyfish", undefined, 1000, 100, 2, 100); // for testing only

  await app.start(process.env.PORT || 3000);
  console.log("App is running on port", process.env.PORT || 3000);
})();
