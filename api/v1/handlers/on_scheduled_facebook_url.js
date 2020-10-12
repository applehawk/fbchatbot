'use strict';

module.exports = async (controller) => {
  controller.on(['message', 'facebook_postback'], async (bot, message) => {
    if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_facebook_url_yes') {
      const DIALOG_FACEBOOK_URL_ID = 'DIALOG_FACEBOOK_URL_ID';
      await controller.trigger(['sender_action_typing'], bot, {
        options: { recipient: message.sender },
      });
      await bot.replaceDialog(DIALOG_FACEBOOK_URL_ID);
    // } else if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_facebook_url_no') {
    //   ///
    }
  });
};
