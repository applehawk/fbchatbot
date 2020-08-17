'use strict';

const CronJob = require('cron').CronJob;

module.exports = async (controller) => {
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';

  controller.on(['ask_for_scheduled_a_call'], async (bot, message) => {

    // [PROD]
    let date = new Date();
    date.setHours(date.getHours() + 48);

    // // [STAGING]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 5);

    // // [TEST]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 1);

    console.log('now:', new Date().toLocaleString(), 'scheduled:', date.toLocaleString());

    const job = new CronJob(
      date,
      async () => {
        const messageRef = {
          ...message,
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
        };

        const dialogBot = await controller.spawn(messageRef.recipient.id);
        await dialogBot.startConversationWithUser(messageRef.recipient.id);

        controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient: messageRef.recipient } });
        await dialogBot.replaceDialog(SCHEDULED_A_CALL_ID, { messageRef });
      },
      null,
      false,
      'Europe/Moscow'
    );
    // Use this if the 4th param is default value(false)
    job.start();
    /**
     * #END Scheduling Automation
     */
  });
};
