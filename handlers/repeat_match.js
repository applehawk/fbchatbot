'use strict';

const CronJob = require('cron').CronJob;
const {
  getUserContextProperties,
  resetUserContextProperties,
} = require('../helpers.js');

module.exports = async (controller) => {
  controller.on(['repeat_match'], async (bot, message) => {
    // [PROD]
    let date = new Date();
    date.setHours(date.getHours() + 1);

    // // [STAGING]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 5);

    // // [TEST]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 1);

    const job = new CronJob(
      date,
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
          await controller.trigger(['match'], dialogBot, messageRef);
        }
      },
      null,
      false,
      'Europe/Moscow'
    );
    // Use this if the 4th param is default value(false)
    job.start();
  });
};
