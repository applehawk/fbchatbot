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
    // date.setMinutes(date.getMinutes() + 30);

    // // [TEST]
    // let date = new Date();
    // date.setMinutes(date.getMinutes() + 1);

    console.log('now:', new Date().toLocaleString(), 'scheduled:', date.toLocaleString());

    const job = new CronJob(
      date,
      async () => {
        const task = setTimeout(async () => {
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
          await bot.replaceDialog(SCHEDULED_A_CALL_ID, { message });
          job.stop();
        }, 1000);
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
