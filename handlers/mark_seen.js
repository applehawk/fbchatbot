'use strict';

module.exports = async (controller) => {
  controller.on(['mark_seen'], async (bot, message) => {
    await bot.api.callAPI('/me/messages', 'POST', {
      recipient: message.sender,
      sender_action: 'mark_seen',
    });
  });
};
