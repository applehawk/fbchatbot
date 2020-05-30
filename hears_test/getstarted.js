'use strict';

const GET_STARTED_PAYLOAD = 'getstarted_payload';

module.exports = (controller) => {
    controller.hears('getstarted', ['message', 'direct_message'], async (bot, message) => {
        const context = bot.getConfig('context');
        const activity = context._activity;

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
            const api = await controller.adapter.getAPI(activity);

            const url = `/${userId}`;
            const response = await api.callAPI(url, 'GET');
            const result = JSON.stringify(response, null, 2);
            console.log(result);

            await api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.log(error);
        }
    })
};
