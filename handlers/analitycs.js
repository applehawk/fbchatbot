'use strict';

const { ANALYTICS_API_KEY } = process.env;

const Amplitude = require('@amplitude/node');

module.exports = async (controller) => {
  const client = Amplitude.init(ANALYTICS_API_KEY);

  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {
    const eventPayload = {
      event_type: message.text === 'All right. Let’s go!' ? 'Finish' : message.postback.title !== undefined ? 'Get Started' : 'Button click',
      event_properties: {
        user_id: message.sender.id,
        time: message.time,
        text: message.text,
      },
      insert_id: `${message.sender.id}_${message.timestamp}`,
    };
    console.log(client, { ...eventPayload });
    await client.logEvent({ ...eventPayload });
  });
};
