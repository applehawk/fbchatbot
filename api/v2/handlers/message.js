'use strict';

module.exports = async (controller) => {
  controller.on([
    'direct_message',
    'facebook_postback',
    'legacy_reply_to_message_action',
    'message',
    'messaging_postback'
  ], async (bot, message) => {
    if (message.text === 'getstarted_payload') {
      await controller.trigger(['start'], bot, message);
      return;
    }

    await controller.trigger(['ANALYTICS_EVENT'], bot, message);
  });
};
