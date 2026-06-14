module.exports = {
  name: "/f-start",
  description: "Get started with Fishtopia",
  execute: async ({ command, ack, respond, client }) => {
    const DATA = global.data;
    await ack();
    try {
      const db = global.db;
      console.log(command);
      const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(command.user_id);
      if (user) {
        // user already went through the start process
        const blocks = DATA.blocks["error"];
        blocks[0].text.text = "You've already completed the start process. You can start fishing now.";
        await client.chat.postEphemeral({
            channel: command.channel_id,
            user: command.user_id,
            blocks: blocks
        });
        
        return;
      }

      const block = DATA.blocks.start.block[0];
      console.log(block);
      await client.chat.postMessage({
        channel: command.channel_id,
        blocks: [block],
      });
    } catch (error) {
      console.error("Error in /f-start command: ", error);
    }
  },
  actions: {
    prev: async ({ action, ack, client, body }) => {
      const DATA = global.data;
      await ack();
      const value = action.value; // current page
      console.log(value);

      if (parseInt(value) > 1) {
        const nextPage = parseInt(value) - 1;
        const block = JSON.parse(JSON.stringify(DATA.blocks.start.block[0]));
        const text = DATA.blocks.start.pages[nextPage - 1];
        block.title.text = text.title;
        block.body.text = text.body;
        block.subtitle.text = `Fishtopia Guide (${nextPage}/7)`;
        block.actions[0].value = String(nextPage);
        block.actions[1].value = String(nextPage);
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          text: "Getting started with Fishtopia...",
          blocks: [block],
        });
      }
    },
    next: async ({ action, ack, client, body }) => {
      const DATA = global.data;
      await ack();
      const value = action.value;

      if (parseInt(value) < 7) {
        const nextPage = parseInt(value) + 1;
        const block = JSON.parse(JSON.stringify(DATA.blocks.start.block[0]));
        const text = DATA.blocks.start.pages[nextPage - 1];
        block.title.text = text.title;
        block.body.text = text.body;
        block.subtitle.text = `Fishtopia Guide (${nextPage}/7)`;
        block.actions[0].value = String(nextPage);
        block.actions[1].value = String(nextPage);
        if (nextPage === 7) {
          block.actions[1].text.text = "Finish";
        }
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          text: "Getting started with Fishtopia...",
          blocks: [block],
        });
      } else if (parseInt(value) === 7) {
        // end of guide -> set up user
        const db = global.db;
        const blocks = DATA.blocks["start-end"];
        await client.chat.update({
          channel: body.channel.id,
          ts: body.message.ts,
          text: "Getting started...",
          blocks: blocks,
        });
      }
    },
    select_username: async ({ action, ack, client, body, view }) => {
      await ack();
      console.log(action);
      const username =
        body.state.values["username-input-block"]["username-input-action"]
          .value;
      console.log(username);
      if (username.length < 2) {
        const blocks = global.data.blocks["error"];
        blocks[0].text.text = "Username must be at least 2 characters long.";
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          blocks: blocks,
        });
        return;
      } else {
        // check if username is already taken
        const db = global.db;
        const existingUser = db
          .prepare("SELECT * FROM users WHERE username = ?")
          .get(username);
        if (existingUser) {
          const blocks = JSON.parse(
            JSON.stringify(global.data.blocks["error"]),
          );
          blocks[0].text.text = "Username is already taken.";
          await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            blocks: blocks,
          });
        } else {
          const block = JSON.parse(
            JSON.stringify(global.data.blocks["start-end"][0]),
          );
          block.body.text = "Setting up database for " + username + "...";
          await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: [block],
          });
          // add user to dtabase
          const db = global.db;
          db.prepare("INSERT INTO users (username, id, data) VALUES (?, ?, ?)").run(username, body.user.id, JSON.stringify({
            inventory: [], // mainly caught fish and other items,
            boats: [],
            equipment: [], // tools and baits
            stats: {}
          }));
          const block2 = JSON.parse(JSON.stringify(global.data.blocks["start-end"][0]));
          block2.body.text = "You are all set! Welcome to Fishtopia, " + username + "!";
          block2.subtitle.text = "Account created successfully!";
          await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            blocks: [block2]
          })
        }
      }
    },
    dismiss: async ({ action, ack, client, body, respond }) => {
      await ack();
      await respond({
        delete_original: true,
      });
    },
  },
};
