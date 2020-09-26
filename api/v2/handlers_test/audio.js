'use strict';

module.exports = async (controller) => {
  controller.on(['message'], async (bot, message) => {
    if (message.attachments && message.attachments.type === 'audio') {
      // await bot.reply(message, 'Nice picture.');
    }
  });
};
