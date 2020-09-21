'use stirct';

module.exports = async (controller) => {
  controller.on(['dialog'], async (bot, options) => {
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

    // // v1 [OK]
    // const dialogBot = await controller.spawn(id);
    // await dialogBot.startConversationWithUser(id);

    // await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient: message.recipient } });
    // await dialogBot.say(message);

    // v2 [OK]
    controller.spawn(id).then(dialogBot => {
      dialogBot.startConversationWithUser(id).then(() => {
        controller.trigger(['sender_action_typing'], dialogBot, {
          options: { recipient: message.recipient },
        }).then(() => dialogBot.say(message));
      });
    });
  });
};
