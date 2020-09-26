'use strict';

const CronJob = require('cron').CronJob;
const { getUserContextProperties, resetUserContextProperties } = require(`../helpers.js`);

module.exports = async (controller) => {
  controller.on(['session_check'], async (bot, message) => {
    let senderProperties = await getUserContextProperties(controller, bot, message);

    if (!!senderProperties.expired_at && !!senderProperties.conversation_with && senderProperties.ready_to_conversation === 'busy') {
      let expired_at = new Date(senderProperties.expired_at > Date.now() ? senderProperties.expired_at : Date.now() + 5000);

      console.log(`[SESSION]: ${message.recipient.id} > ${senderProperties.conversation_with} EXPIRED AT: ${expired_at.toLocaleString()}`);

      const job = new CronJob(
        expired_at,
        async () => {
          const dialogBot = await controller.spawn(message.sender.id);
          await dialogBot.startConversationWithUser(message.sender.id);
          const messageRef = {
            ...message,
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
          };
          const { ready_to_conversation } = await getUserContextProperties(controller, dialogBot, messageRef);
          if (ready_to_conversation === 'busy') {
            await resetUserContextProperties(controller, dialogBot, messageRef);
          }
        },
        null,
        false,
        'Europe/Moscow'
      );
      // Use this if the 4th param is default value(false)
      job.start();
    }
  });
};
