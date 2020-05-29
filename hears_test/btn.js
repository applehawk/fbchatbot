'use strict';

const {
    communityDict,
} = require(`../constants.js`);

module.exports = (controller) => {
    const getCommunityButtons = () => {
        const buttons = [];
        Object.keys(communityDict).forEach((key, i) => {
            buttons.push({
                type: 'postback',
                title: communityDict[key],
                payload: i,
            });
        });
        return buttons;
    };

    controller.hears('btn', ['message', 'direct_message'], async (bot, message) => {
        const context = bot.getConfig('context');
        const activity = context._activity;
        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        const buttons = [ ...getCommunityButtons() ];

        const elements = [];

        communityDict.forEach((item, i) => {
            elements.push({
                title: communityDict[i],
                image_url: `https://picsum.photos/400/300/?random=${i + 10}`,
                subtitle: 'We have the right hat for everyone.',
                buttons: [buttons[i], buttons[i], buttons[i]],
            });
        });

        const options = {
            recipient: {
                id: userId,
            },
            message: {
                attachment: {
                    type: 'template',
                    payload:{
                        template_type: 'generic',
                        elements: elements,
                    }
                }
            }
        };

        try {
            const api = await controller.adapter.getAPI(activity);
            await api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.log(error);
        }
    });
};
