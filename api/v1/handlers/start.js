'use strict';

const { GIF_GREETING } = require(`../constants.js`);
const { UserState } = require('botbuilder');
const {
  getUserContextProperties,
  resetUserContextProperties,
} = require(`../helpers.js`);

module.exports = async (controller) => {
  const DIALOG_GREETING_ID = 'DIALOG_GREETING_ID';

  controller.on(['start'], async (bot, message) => {
    bot.cancelAllDialogs();
    const refer = message.recipient.user_ref !== undefined ? 'chat_plugin' : 'messenger';
    console.log('[GET STARTED]:', message, '[refer]:', refer, message.recipient.user_ref);

    const recipient = {
      id: message.sender.id,
    };

    /**
     * #BEGIN Bot typing
     */
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

    /**
     * @TODO User comes from messenger or chat
     */
    // if (message.recipient.user_ref === 'messenger') {
    //   ///
    // } else {
    //   ///
    // }

    if (message.text === 'getstarted_payload' || message.text === 'Get Started') {
      try {
        const userId = `facebook/conversations/${message.user}-${message.user}/`;
        await bot.controller.storage.delete([userId]);

        const senderProperties = await getUserContextProperties(controller, bot, message);

        await senderProperties.conversation_with_property.set(senderProperties.context, 0);
        await senderProperties.expired_at_property.set(senderProperties.context, 0);

        /**
         * @Info For start set ready_to_conversation as 'busy'
         */
        await senderProperties.ready_to_conversation_property.set(senderProperties.context, 'busy');

        /**
         * Save userState changes to storage
         */
        await senderProperties.userState.saveChanges(senderProperties.context);

        message.value = 'Get Started';
        controller.trigger(['ANALYTICS_EVENT'], bot, message);

        await controller.trigger(['delete_menu'], bot,  recipient);

        // Get user's FB Profile Info
        const url = `/${message.sender.id}`;
        const response = await bot.api.callAPI(url, 'GET');

        const username = `${
          response.first_name !== '' ? response.first_name : ''
        }${
          response.last_name !== '' ? ' ' + response.last_name : ''
        }`;
        const profile_pic = response.profile_pic;

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

        /**
         * #BEGIN Bot typing
         * @Tip It will be automatically deleted at the beginning of the next dialog.
         */
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
        await bot.replaceDialog(DIALOG_GREETING_ID, { username, profile_pic });
      } catch(error) {
        console.error('[start.js:93 ERROR]:', error);
      }
    // } else {
      /**
       * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
       * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
       */
      // await bot.changeContext(message.reference);

      // if (message.text) {
      //   console.log('[postback]:', message.postback.payload);
      //   controller.trigger([message.postback.payload], bot, message);
      // }
    }
  });
};
