'use strict';

module.exports = async (controller) => {
  controller.on(['sender_action_typing'], async (bot, message) => {
    await bot.api.callAPI('/me/messages', 'POST', {
      recipient: message.options.recipient,
      // sender_action: `typing_${message.mode ? 'on' : 'off'}`,
      sender_action: 'typing_on',
    });
  });
};
