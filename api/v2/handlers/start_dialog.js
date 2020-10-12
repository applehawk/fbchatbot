'use stirct';

module.exports = async (controller) => {
  controller.on(['start_dialog'], async (bot, options) => {
    try {
      const id = options.user;
      const message = {
        ...options,
        channel: id,
        message: {
          text: options.text || options.message.text,
        },
        quick_replies: [...options.quick_replies],
        messaging_type: 'MESSAGE_TAG',
        recipient: { id },
        sender: { id },
        tag: 'ACCOUNT_UPDATE',
        text: options.text,
        user: id,
        reference: {
          activityId: undefined,
          user: { id, name: id },
          conversation: { id },
        },
        incoming_message: {
          channelId: 'facebook',
          conversation: { id },
          from: { id, name: id },
          recipient: { id, name: id },
          channelData: {
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
            sender: { id },
          },
        },
      };

      await controller.trigger(['sender_action_typing'], bot, { options: { recipient: options.recipient } });
      await bot.say(message);
    } catch (error) {
      console.error('[start_dialog.js:41 ERROR]:', error);
    }
  });
};
