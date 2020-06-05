'use strict';

module.exports = async (controller) => {
    // look for sticker, image and audio attachments
    // capture them, and fire special events
    controller.on('message_received', async (bot, message) => {
        // await bot.cancelAllDialogs();
        // console.log('[message]:', message);

        // if (!message.text) {
        //     if (message.sticker_id) {
        //         controller.trigger('sticker_received', [bot, message]);
        //         return false;
        //     } else if (message.attachments && message.attachments[0]) {
        //         controller.trigger(message.attachments[0].type + '_received', [bot, message]);
        //         return false;
        //     }
        // }

    });
};
