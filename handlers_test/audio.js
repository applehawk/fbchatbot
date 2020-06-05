'use strict';

module.exports = async (controller) => {
    controller.on('audio_received', async (bot, message) => {
        // await bot.reply(message, 'I heard that!!');
    });
};
