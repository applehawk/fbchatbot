'use strict';

module.exports = (controller) => {
    controller.hears('profile', ['message', 'direct_message'], async (bot, message) => {
        const context = bot.getConfig('context');
        const activity = context._activity;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        try {
            const api = await controller.adapter.getAPI(activity);
            const url = `/${userId}`;
            // const response = await api.callAPI('/me', 'GET');
            const response = await api.callAPI(url, 'GET');
            const result = JSON.stringify(response, null, 2);
            console.log(result);
            await bot.say(result);
        } catch(error) {
            console.log(error);
        }
    });
};
