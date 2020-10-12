'use strict';
const Amplitude = require('@amplitude/node');

module.exports = async (controller) => {
  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {
    // if ((message.type === 'message' || message.type === 'facebook_postback' || message.type === 'messaging_postback')) {
      console.log(`[ANALYTICS_EVENT]: ${message.type}${!!message.value ? ' ' + message.value : ''} ${message.text}`);

      let client = Amplitude.init(process.env.ANALYTICS_API_KEY);
      client.logEvent({
        event_type: !!message.value ? message.value : message.type,
        user_id: message.sender.id,
        event_properties: {
          text: message.text,
        }
      });

      const options = {
        event: 'CUSTOM_APP_EVENTS',
        custom_events: JSON.stringify([{
          _eventName: !!message.value ? message.value : message.type,
          _logTime: message.timestamp,
          fb_description: message.text,
        }]),
        advertiser_tracking_enabled: 1,
        application_tracking_enabled: 1,
        extinfo: JSON.stringify(['mb1']),
        page_id: message.reference.bot.id,
        page_scoped_user_id: message.user,
      };
      const status = await bot.api.callAPI(`/${process.env.FACEBOOK_APPID}/activities`, 'POST', options);
    // }
  });
};
