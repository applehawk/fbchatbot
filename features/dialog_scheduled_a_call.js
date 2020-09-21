'use strict';

const {/*  getUserContextProperties,  */ resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.on(['message', 'facebook_postback'], async (bot, message) => {
    if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_call_yes') {
      message.value = 'Scheduled a call';
      controller.trigger(['ANALYTICS_EVENT'], bot, message);
      await controller.trigger(['sender_action_typing'], bot, {
        options: { recipient: message.sender },
      });
      await bot.say({
        text: 'Great!',
      });
    } else if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_call_no') {
      message.value = 'Scheduled a call';
      const messageRef = message;
      const dialogBot = await controller.spawn(messageRef.user);
      await dialogBot.startConversationWithUser(messageRef.user);
      controller.trigger(['ANALYTICS_EVENT'], dialogBot, messageRef);
      controller.trigger(['scheduling_call_no'], dialogBot, messageRef);
    }
  });
};
