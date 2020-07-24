'use strict;'

module.exports = async (controller) => {
  controller.on(['create_menu'], async (bot, payload) => {
    await controller.trigger(['delete_menu'], bot,  payload.recipient);

    const menu = {
      recipient: payload.recipient,
      psid: payload.recipient.id,
      persistent_menu: [{
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
          ...payload.call_to_actions,
        ],
      }],
    };

    try {
      await bot.api.callAPI('/me/custom_user_settings', 'POST', menu);
    } catch(error) {
      console.error('[create_menu.js:22 ERROR]:', payload, error);
      return;
    }
  });
};
