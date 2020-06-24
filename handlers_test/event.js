'use strict';

module.exports = async (controller) => {
    // controller.on(['message_creative'], async (bot, message) => {
    // controller.on(['messaging_referral'], async (bot, message) => {
    // controller.on(['messaging_postback'], async (bot, message) => {
    // controller.on(['message_reads'], async (bot, message) => {
    // controller.on(['broadcast_message'], async (bot, message) => {
    // controller.on(['message_tag'], async (bot, message) => {
    // controller.on(['message_reaction'], async (bot, message) => {
    // controller.on(['message_received'], async (bot, message) => {
    // controller.on(['direct_message'], async (bot, message) => {
    // controller.on(['facebook_optin'], async (bot, message) => {
    // controller.on(['welcome_back'], async (bot, message) => {
    controller.on(['incoming_message'], async (bot, message) => {
        // await bot.cancelAllDialogs();
        console.log('[incoming_message]:', message);

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
