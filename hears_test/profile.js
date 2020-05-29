'use strict';

module.exports = (controller) => {
    controller.hears('profile', ['message', 'direct_message'], async (bot, message) => {
        const context = bot.getConfig('context');
        const activity = context._activity;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        const options = {
            recipient: {
                id: userId,
            },
            message: {
                text: 'hello',
            },
        };

        try {
            // await api.callAPI('/me/messenger_profile', 'POST', options);
            const api = await controller.adapter.getAPI(activity);
            const result = await api.callAPI('/me', 'GET', options);
            await bot.say(JSON.stringify(result, null, 2));
        } catch(error) {
            console.log(error);
        }
    })
};
