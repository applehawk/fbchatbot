'use strict';

module.exports = async (controller) => {
  controller.on(['mark_seen'], async (bot, message) => {
    // if (process.env.NODE_ENV === 'production') {
      await bot.api.callAPI('/me/messages', 'POST', {
        recipient: message.sender,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        sender_action: 'mark_seen',
      });
    // }
  });
};
