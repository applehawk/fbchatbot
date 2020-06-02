'use strict';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { UserState } = require('botbuilder');

module.exports = async (controller) => {
    const GREETING_ID = 'GREETING_ID';
    const greeting = controller.dialogSet.dialogs[GREETING_ID];

    controller.on('facebook_postback', async (bot, message) => {
        if (message.postback.title === 'Get Started') {
            try {
                const context = bot.getConfig('context');
                const activity = context._activity;

                const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

                // user state properties
                const userState = new UserState(controller.storage);

                const usernameProperty = userState.createProperty('username');
                const profilePicProperty = userState.createProperty('user_pic');

                let username = await usernameProperty.get(context);
                let profilePic = await profilePicProperty.get(context);

                // Get user's FB Profile Info
                const url = `/${userId}`;
                const response = await bot.api.callAPI(url, 'GET');

                username = `${response.first_name} ${response.last_name}`;
                profilePic = response.profile_pic;

                const result = JSON.stringify(response, null, 2);
                console.log(result, username, profilePic);

                await usernameProperty.set(context, username);
                await profilePicProperty.set(context, profilePic);

                // Save userState changes to storage
                await userState.saveChanges(context);

                await bot.beginDialog(GREETING_ID, { username });
            } catch(error) {
                console.log(error);
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
