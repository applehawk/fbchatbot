'use strict';

const { resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';

  controller.on(['scheduling_call_no'], async (bot, message) => {
    const messageRef = {
      ...message,
      recipient: message.sender,
    };

    const dialogBot = await controller.spawn(messageRef.recipient.id);
    await dialogBot.startConversationWithUser(messageRef.recipient.id);

    await resetUserContextProperties(controller, dialogBot, messageRef);
    controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient: messageRef.recipient } });
    await dialogBot.replaceDialog(SCHEDULED_A_CALL_ID, {message});
  });
};
