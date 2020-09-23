'use strict';

module.exports = async (controller) => {
  controller.on(['create_menu'], async (bot, payload) => {
    // if (process.env.NODE_ENV === 'production') {
      await controller.trigger(['delete_menu'], bot,  payload.recipient);
      const menu = {
        messaging_type: 'MESSAGE_TAG',
        persistent_menu: [{
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
            ...payload.call_to_actions,
          ],
        }],
        psid: payload.recipient.id,
        recipient: payload.recipient,
        tag: 'ACCOUNT_UPDATE',
      };

      try {
        await bot.api.callAPI('/me/custom_user_settings', 'POST', menu);
      } catch(error) {
        console.error('[create_menu.js:24 ERROR]:', payload, error);
      }
    // }
  });
};
