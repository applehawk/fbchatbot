'use strict';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = async (controller) => {
    const GREETING_ID = 'GREETING_ID';

    controller.on(['start'], async (bot, message) => {
        bot.cancelAllDialogs();
        const refer = message.recipient.user_ref !== undefined ? 'chat_plugin' : 'messenger';
        console.log('[GET STARTED]:', message, '[refer]:', refer, message.recipient.user_ref);
        /**
         * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
         * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
         */
        // await bot.changeContext(message.reference);

        const userId = `facebook/conversations/${message.user}-${message.user}/`;
        await bot.controller.storage.delete([userId]);
        // if (message.recipient.user_ref !== undefined) {

        // }
        // if (message.postback.title === 'Get Started' ||
        //     ( (message.type === 'legacy_reply_to_message_action' && message.message === 'Get Started') ||
        //         (message.recipient.user_ref !== undefined && message.message === 'Get Started')) ||
        //             message.text === 'getstarted_payload' ) {
        if (message.text === 'getstarted_payload' || message.text === 'Get Started') {
            try {
                message.value = 'Get Started';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);

                const recipient = {
                    id: message.sender.id,
                };

                // [Tip] Deleting menu
                await bot.api.callAPI('/me/custom_user_settings', 'DELETE', { // [OK]
                    recipient,
                    psid: message.sender.id,
                    params: ['persistent_menu'],
                });

                /**
                 * #BEGIN Bot typing
                 */
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

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
                                attachment_id: process.env.GIF_START,
                                // url: GIF_GREETING,
                                // is_reusable: true,
                            },
                        },
                    },
                };
                await bot.api.callAPI('/me/messages', 'POST', options);

                // #BEGIN Bot typing
                // [Tip] It will be automatically deleted at the beginning of the next dialog.
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
                await bot.beginDialog(GREETING_ID, { username, profilePic });
            } catch(error) {
                console.error('[start.js:79 ERROR]:', error);
            }
        } else {
            // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
            // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
            await bot.changeContext(message.reference);

            if (message.text) {
                console.log('[postback]:', message.postback.payload);
                controller.trigger([message.postback.payload], bot, message);
            }
        }
    });
};
