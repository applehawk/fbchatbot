'use strict';

const CronJob = require('cron').CronJob;
const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.on(['repeat_match'], async (bot, message) => {
    // // [PROD]
    // let date = new Date();
    // date.setHours(date.getHours() + 1);

    // // [STAGING]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 5);

    // [TEST]
    let date = new Date();
    date.setMinutes(date.getMinutes() + 5);

    const job = new CronJob(
      date,
      async () => {
        const dialogBot = await controller.spawn(message.sender.id);
        await dialogBot.startConversationWithUser(message.sender.id);

        let senderProperties = await getUserContextProperties(controller, dialogBot, message);

        Object.assign(message, {
          ...message,
          messaging_type: 'MESSAGE_TAG',
          senderProperties,
          tag: 'ACCOUNT_UPDATE',
        });

        await controller.trigger(['match'], dialogBot, message);

        await message.senderProperties.userState.saveChanges(message.senderProperties.context);
      },
      null,
      false,
      'Europe/Moscow'
    );
    // Use this if the 4th param is default value(false)
    job.start();
  });
};
