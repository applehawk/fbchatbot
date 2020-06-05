'use strict';

module.exports = async (controller) => {
    controller.on('sticker_received', async (bot, message) => {
        // await bot.reply(message, 'Cool sticker.');
    });
};
