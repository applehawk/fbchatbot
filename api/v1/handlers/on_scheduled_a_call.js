'use strict';

module.exports = async (controller) => {
  controller.on(['message', 'facebook_postback'], async (bot, message) => {
    if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_call_yes') {
      message.value = 'Scheduled a call';
      await controller.trigger(['ANALYTICS_EVENT'], bot, message);
      await controller.trigger(['sender_action_typing'], bot, {
        options: { recipient: message.sender },
      });
      await bot.say({
        text: 'Great!',
      });
    } else if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_call_no') {
      message.value = 'Scheduled a call';
      await controller.trigger(['ANALYTICS_EVENT'], bot, message);
      const DIALOG_SCHEDULED_A_CALL_ID = 'DIALOG_SCHEDULED_A_CALL_ID';

      await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      await bot.replaceDialog(DIALOG_SCHEDULED_A_CALL_ID);
    }
  });
};
