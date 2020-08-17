'use strict';

const { GIF_GREETING } = require('../constants.js');
const { UserState } = require('botbuilder');
const {
    getUserContextProperties,
    resetUserContextProperties,
} = require('../helpers.js');

module.exports = async (controller) => {
    const GREETING_ID = 'GREETING_ID';

    controller.on(['start'], async (bot, message) => {
        bot.cancelAllDialogs();
        const refer = message.recipient.user_ref !== undefined ? 'chat_plugin' : 'messenger';
        console.log('[GET STARTED]:', message, '[refer]:', refer, message.recipient.user_ref);

        const userId = `facebook/conversations/${message.user}-${message.user}/`;
        await bot.controller.storage.delete([userId]);

        const senderProperties = await getUserContextProperties(controller, bot, message);

        await controller.trigger(['delete_menu'], bot, message.sender);

        await senderProperties.conversationWithProperty.set(senderProperties.context, 0);
        await senderProperties.expiredAtProperty.set(senderProperties.context, 0);
        await senderProperties.readyToConversationProperty.set(senderProperties.context, 'ready');

        /**
        * Save userState changes to storage
        */
        await senderProperties.userState.saveChanges(senderProperties.context);

        /**
         * @TODO User comes from messenger or chat
         */
        // if (message.recipient.user_ref === 'messenger') {
        //     ///
        // } else {
        //     ///
        // }

        if (message.text === 'getstarted_payload' || message.text === 'Get Started') {
            try {
                message.value = 'Get Started';
                controller.trigger(['ANALYTICS_EVENT'], bot, message);

                const recipient = {
                    id: message.sender.id,
                };

                await controller.trigger(['delete_menu'], bot,  recipient);

                /**
                 * #BEGIN Bot typing
                 */
                controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

                // Get user's FB Profile Info
                const url = `/${message.sender.id}`;
                const response = await bot.api.callAPI(url, 'GET');

                const username = `${
                    response.first_name !== '' ? response.first_name : ''
                }${
                    response.last_name !== '' ? ' ' + response.last_name : ''
                }`;
                const profilePic = response.profile_pic;

                const options = {
                    recipient,
                    message: {
                        attachment: {
                            type: 'image',
                            payload: {
                                // attachment_id: process.env.GIF_START,
                                url: GIF_GREETING,
                                // is_reusable: true,
                            },
                        },
                    },
                };
                await bot.api.callAPI('/me/messages', 'POST', options);

                // #BEGIN Bot typing
                // [Tip] It will be automatically deleted at the beginning of the next dialog.
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
                await bot.replaceDialog(GREETING_ID, { username, profilePic });
            } catch(error) {
                console.error('[start.js:90 ERROR]:', error);
            }
        // } else {
            /**
             * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
             * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
             */
            // await bot.changeContext(message.reference);

            // if (message.text) {
            //     console.log('[postback]:', message.postback.payload);
            //     controller.trigger([message.postback.payload], bot, message);
            // }
        }
    });
};
