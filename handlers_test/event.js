'use strict';

module.exports = async (controller) => {
    // controller.on(['message_creative'], async (bot, message) => {
    // controller.on(['messaging_referrals'], async (bot, message) => {
    // controller.on(['messaging_postbacks'], async (bot, message) => {
    // controller.on(['message_reads'], async (bot, message) => {
    // controller.on(['broadcast_messages'], async (bot, message) => {
    controller.on(['message_tag'], async (bot, message) => {
    // controller.on(['message_reactions'], async (bot, message) => {
        // await bot.cancelAllDialogs();
        console.log('[message_tag]:', message);

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
