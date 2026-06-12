const { App } = require("@slack/bolt");
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

app.command("/f-ping", async ({ command, ack, respond, client }) => {
  await ack();

  const start = Date.now();
  await client.api.test();
  const ping = Date.now() - start;
  //   const recievedTime = new Date();
  //   const eventTime = Math.floor(parseFloat(command.ts) * 1000);
  //   const latency = recievedTime - eventTime;
  //   const wsPing = app.receiver.client?.ping + " ms" || "Unknown";

  try {
    let blocks = DATA.blocks.ping;
    blocks[0].subtitle.text = `${ping} ms`;
    console.log(blocks);
    await client.chat.postMessage({
      channel: command.channel_id,
      text: "Pong!",
      blocks: blocks,
    });
  } catch (error) {
    console.error("Error occured while sending message: ", error);
  }
});

app.action("test_ping", async ({ action, ack, client, body }) => {
  await ack();
  const start = Date.now();
  await client.api.test();
  const ping = Date.now() - start;
  try {
    let blocks = DATA.blocks.ping;
    blocks[0].subtitle.text = `${ping} ms`;
    blocks[0].title.text = "Updated Ping";
    await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        text: "Pong!",
        blocks: blocks
    })

  } catch (error) {
    console.error("Error occured while testing ping: " , error);
  }
});

(async () => {
  const { default: data } = await import("./data.json", {
    with: { type: "json" },
  });
  DATA = data;
  // console.log(data);

  await app.start(process.env.PORT || 3000);
  console.log("App is running on port", process.env.PORT || 3000);
})();
