'use strict';

module.exports = async (controller) => {
  // return;
  controller.on(['delete_menu'], async (bot, recipient) => {
    /**
     * Deleting menu for recipient
     */
    // if (process.env.NODE_ENV === 'production') {
      try {
        await bot.api.callAPI('/me/custom_user_settings', 'DELETE', { // [OK]
          messaging_type: 'MESSAGE_TAG',
          params: ['persistent_menu'],
          psid: recipient.id,
          recipient: recipient,
          tag: 'ACCOUNT_UPDATE',
        });
      } catch(error) {
        console.error('[delete_menu.js:19 ERROR]:', recipient, error);
      }
    // }
  });
};
