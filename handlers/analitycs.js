'use strict';

const { ANALYTICS_API_KEY } = process.env;

const Amplitude = require('@amplitude/node');

module.exports = async (controller) => {
  const client = Amplitude.init(process.env.ANALYTICS_API_KEY);

  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {
    // // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    // const botRef = await bot.changeContext(message.reference);

    const options = {
      event_type: message.text === 'All right. Let’s go!' ? 'Finish' : message.postback.title !== undefined ? 'Get Started' : 'Button click',
      event_properties: {
        user_id: message.sender.id,
        time: message.time,
        text: message.text,
      },
      insert_id: `${message.sender.id}_${message.timestamp}`,
    };
    // const options = {
    //   event: 'CUSTOM_APP_EVENTS',
    //   custom_events: JSON.stringify([{
    //     _eventName: message.text === 'All right. Let’s go!' ? 'Finish' : message.postback.title !== undefined ? 'Get Started' : 'Button click',
    //     _user_id: message.sender.id,
    //     _time: message.time,
    //     text: message.text,
    //   }]),
    //   page_id: message.reference.bot.id,
    //   page_scoped_user_id: message.recipient.id,
    // };

    // await controller.adapter.sendActivities(options);
    // // await botRef.api.callAPI(`/activities`, 'POST', options);

    client.logEvent({ ...options });
    // console.log(client, { ...options });
  });
};
