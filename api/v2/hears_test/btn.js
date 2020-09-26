'use strict';

const { communityDict } = require(`../constants.js`);

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

    controller.hears(new RegExp(/^btn$/i), ['message'], async (bot, message) => {
        const buttons = [ ...getCommunityButtons() ];

        const elements = [];

        communityDict.forEach((item, i) => {
            elements.push({
                title: 'title1 title2 title3 title4 title5 title6 title7 title8 title9 title10',
                image_url: `https://picsum.photos/300/200/?random=${i + 10}`,
                subtitle: 'We have the right hat for everyone.',
                buttons: [buttons[i]],
            });
        });

        const options = {
            recipient: message.sender,
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
