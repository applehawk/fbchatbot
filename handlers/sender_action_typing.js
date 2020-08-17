'use strict';

module.exports = async (controller) => {
  controller.on(['sender_action_typing'], async (bot, message) => {
    // if (process.env.NODE_ENV === 'production') {
      await bot.api.callAPI('/me/messages', 'POST', {
        recipient: message.options.recipient,
        sender_action: 'typing_on',
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
      });
    // }
  });
};
