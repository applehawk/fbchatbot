'use strict';

module.exports = async (controller) => {
    controller.on('image_received', async (bot, message) => {
        // await bot.reply(message, 'Nice picture.');
    });
};
