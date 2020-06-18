'use strict';

const {
    communityDict,
} = require(`../constants.js`);

module.exports = async (controller) => {
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
        const buttons = [ ...getCommunityButtons() ];

        const elements = [];

        communityDict.forEach((item, i) => {
            elements.push({
                title: communityDict[i],
                image_url: `https://picsum.photos/300/200/?random=${i + 10}`,
                subtitle: 'We have the right hat for everyone.',
                buttons: [buttons[i]],
            });
        });

        const options = {
            recipient: message.recipient,
            message: {
                attachment: {
                    type: 'template',
                    payload:{
                        template_type: 'generic',
                        elements,
                    }
                }
            }
        };

        try {
            await bot.api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.error(error);
        }
    });
};
