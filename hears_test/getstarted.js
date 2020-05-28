'use strict';

const { FacebookAPI } = require('botbuilder-adapter-facebook');

const api = new FacebookAPI(
    process.env.FACEBOOK_ACCESS_TOKEN,
    process.env.FACEBOOK_APP_SECRET);

const GET_STARTED_PAYLOAD = 'getstarted_payload';

module.exports = (controller) => {
    controller.hears('getstarted', ['message', 'direct_message'], async (bot, message) => {
        const context = bot.getConfig('context');
        const activity = context._activity;
        // const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        const options = {
            recipient: {
                id: userId,
            },
            get_started: {
                payload: GET_STARTED_PAYLOAD,
            },
        };

        try {
            // await api.callAPI('/me/messenger_profile', 'POST', options);
            await api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.log(error);
        }
    })
};
