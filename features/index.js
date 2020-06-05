'use strict';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { GIF_GREETING } = require('../constants.js');

module.exports = async (controller) => {
    const GREETING_ID = 'GREETING_ID';
    const greeting = controller.dialogSet.dialogs[GREETING_ID];

    controller.on('facebook_postback', async (bot, message) => {
        if (message.postback.title === 'Get Started') {
            try {
                await bot.cancelAllDialogs();
                const context = bot.getConfig('context');
                const activity = context._activity;

                const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

                // Get user's FB Profile Info
                const url = `/${userId}`;
                const response = await bot.api.callAPI(url, 'GET');

                const username = `${response.first_name !== '' ? response.first_name : ''}${response.last_name !== '' ? ' ' + response.last_name : ''}`;
                const profilePic = response.profile_pic;

                const options = {
                    recipient: {
                        id: userId,
                    },
                    message: {
                        attachment: {
                            type: 'image',
                            payload: {
                                url: GIF_GREETING,
                                is_reusable: true,
                            },
                        },
                    },
                };
                await bot.api.callAPI('/me/messages', 'POST', options);

                await bot.beginDialog(GREETING_ID, { username, profilePic });
            } catch(error) {
                console.error(error);
            }
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
