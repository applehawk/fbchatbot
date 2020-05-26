'use strict';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = (controller) => {
    const GREETING_ID = 'GREETING_ID';
    controller.on('facebook_postback', async (bot, message) => {
        if (message.postback.title === 'Get Started') {
            await bot.beginDialog(GREETING_ID);
        }
    });
/*
    /**
     * Detect when a message has a sticker attached

    controller.hears(async(message) => message.sticker_id, 'message', async(bot, message) => {
        await bot.reply(message,'Cool sticker.');
    });

    controller.on('facebook_postback', async(bot, message) => {
        await bot.reply(message,`I heard you posting back a post_back about ${ message.text }`);
    });
*/
};
