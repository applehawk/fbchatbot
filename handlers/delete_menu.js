'use strict;'

module.exports = async (controller) => {
  // return;
  controller.on(['delete_menu'], async (bot, recipient) => {
    /**
     * Deleting menu for recipient
     */
    // if (process.env.NODE_ENV === 'production') {
      try {
        await bot.api.callAPI('/me/custom_user_settings', 'DELETE', { // [OK]
          recipient: recipient,
          psid: recipient.id,
          params: ['persistent_menu'],
        });
      } catch(error) {
        console.error('[delete_menu.js:17 ERROR]:', recipient, error);
      }
    // }
  });
};
