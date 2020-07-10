'use strict;'

module.exports = async (controller) => {
  controller.on(['delete_menu'], async (bot, recipient) => {
    /**
     * Deleting menu for recipient
     */
    await bot.api.callAPI('/me/custom_user_settings', 'DELETE', { // [OK]
      recipient: recipient,
      psid: recipient.id,
      params: ['persistent_menu'],
    });
  });
};
