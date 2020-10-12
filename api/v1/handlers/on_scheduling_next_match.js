'use strict';

const { getUserContextProperties, resetUserContextProperties } = require('../helpers');

module.exports = async (controller) => {
  controller.on(['message', 'facebook_postback'], async (bot, message) => {
    if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_next_match' && message.text === 'Yes, I will!') {
      message.value = 'Skip Match Next Week';
      await controller.trigger(['ANALYTICS_EVENT'], bot, message);
      const senderProperties = await getUserContextProperties(controller, bot, message);
      await senderProperties.skip_property.set(senderProperties.context, false);

      /**
       * Save senderProperties changes to storage
       */
      await senderProperties.userState.saveChanges(senderProperties.context);
      // await controller.trigger(['sender_action_typing'], bot, {
      //   options: { recipient: message.sender },
      // });
      // await bot.say({
      //   text: 'Great!',
      // });
    } else if (!!message.quick_reply && message.quick_reply.payload === 'scheduling_next_match' && message.text === 'No, I will skip') {
      message.value = 'Skip Match Next Week';
      await controller.trigger(['ANALYTICS_EVENT'], bot, message);
      const senderProperties = await getUserContextProperties(controller, bot, message);
      await senderProperties.skip_property.set(senderProperties.context, true);

      /**
       * Save senderProperties changes to storage
       */
      await senderProperties.userState.saveChanges(senderProperties.context);
    }
  });
};
