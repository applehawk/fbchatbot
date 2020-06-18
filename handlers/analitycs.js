'use strict';

module.exports = async (controller) => {
  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {
    // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    await bot.changeContext(message.reference);
    console.log(!!message.value ? message.value : message.type);
    const options = {
      event: 'CUSTOM_APP_EVENTS',
      custom_events: JSON.stringify([{
        _eventName: !!message.value ? message.value : message.type,
        _user_id: message.sender.id,
        _time: message.timestamp,
        text: message.text,
      }]),
      advertiser_tracking_enabled: 1,
      application_tracking_enabled: 1,
      // extinfo: JSON.stringify(['mb1']),
      page_id: message.recipient.id,
      page_scoped_user_id: message.sender.id,
    };
    const status = await bot.api.callAPI(`/${process.env.FACEBOOK_APPID}/activities`, 'POST', options);
    return status;
  });
};
