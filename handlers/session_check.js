'use strict;'

const CronJob = require('cron').CronJob;
const { getUserContextProperties, resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.on(['session_check'], async (bot, message) => {
    let senderProperties = await getUserContextProperties(controller, bot, message);

    if (!!senderProperties.expiredAt && !!senderProperties.conversationWith && senderProperties.readyToConversation === 'busy') {
      let expiredAt = new Date(senderProperties.expiredAt > Date.now() ? senderProperties.expiredAt : Date.now() + 5000);

      console.log(`[SESSION]: ${message.recipient.id} > ${senderProperties.conversationWith} EXPIRED AT: ${expiredAt.toLocaleString()}`);

      const job = new CronJob(
        expiredAt,
        async () => {
          const dialogBot = await controller.spawn(message.sender.id);
          await dialogBot.startConversationWithUser(message.sender.id);
          const messageRef = {
            ...message,
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
          };
          const { readyToConversation } = await getUserContextProperties(controller, dialogBot, messageRef);
          if (readyToConversation === 'busy') {
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
