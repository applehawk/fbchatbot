'use strict';

module.exports = async (controller) => {
  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {
    if (process.env.NODE_ENV !== 'production') {
      /**
       * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
       * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
       */
      // await bot.changeContext(message.reference);

      console.log('[ANALYTICS_EVENT]:', !!message.value ? message.value : message.type);
      return;
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
        // ud:
      };
      const status = await bot.api.callAPI(`/${process.env.FACEBOOK_APPID}/activities`, 'POST', options);
      return status;
    }
  });
};
