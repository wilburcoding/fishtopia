module.exports = {
  name: "/f-ping",
  description: "Test bot's response time",
  execute: async ({ command, ack, respond, client }) => {
    const DATA = global.data;
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
      await client.chat.postMessage({
        channel: command.channel_id,
        text: "Pong!",
        blocks: blocks,
      });
    } catch (error) {
      console.error("Error occured while sending message: ", error);
    }
  },
  actions: {
    test_ping: async ({ action, ack, client, body }) => {
      const DATA = global.data;
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
          blocks: blocks,
        });
      } catch (error) {
        console.error("Error occured while testing ping: ", error);
      }
    },
  },
};
