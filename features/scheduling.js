'use strict';

const CronJob = require('cron').CronJob;

module.exports = async (controller) => {
  // return;
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  const job = new CronJob(
    // Seconds: 0-59
    // Minutes: 0-59
    // Hours: 0-23
    // Day of Month: 1-31
    // Months: 0-11 (Jan-Dec)
    // Day of Week: 0-6 (Sun-Sat)
    // '00 00 12 * * 1', // [PROD]
    '00 */10 * * * *', // [STAGING]
    // '0 */5 * * * *', // [TEST]
    async () => {
      const bot = await controller.spawn();
      const { id: botId } = await bot.api.callAPI('/me', 'GET');

      await storage.connect();

      const docs = await storage.Collection.find();
      const users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
        if (!!_id.match('facebook/users') && state.ready_to_conversation === 'ready') {
          const id = _id.match(/\/(\d+)\/$/)[1];
          if (!!id) {
            accum[_id] = { id, state };
          }
        }
        return accum;
      }, {});

      if (Object.keys(users).length) {
        console.log(Object.keys(users).length);
        Object.values(users).forEach(async ({ id, state }, i) => {
          // if (id === '3049377188434960' || id === '4011572872217706' ) { // [DEV]
            const dialogBot = await controller.spawn(id);

            const message = {
              recipient: { id },
              sender: { id },
              user: id,
              channel: id,
              value: undefined,
              message: { text: '' },
              text: '',
              reference: {
                // ...message.reference,
                activityId: undefined,
                user: { id, name: id },
                bot: { id: botId },
                conversation: { id },
              },
              incoming_message: {
                // ...message.incoming_message,
                channelId: 'facebook',
                conversation: { id },
                from: { id, name: id },
                recipient: { id, name: id },
                channelData: {
                  // ...message.incoming_message.channelData,
                  sender: { id },
                },
              },
            };

            await dialogBot.startConversationWithUser(id);

            // if (state.ready_to_conversation === 'ready') {
              const task = setTimeout(async () => {
                if (!dialogBot.hasActiveDialog()) {
                  await controller.trigger(['match'], dialogBot, message);
                } else if (state.ready_to_conversation === 'busy') {
                  await controller.trigger(['ask_for_scheduled_a_call'], dialogBot, message);
                }
              }, 1000 * i);
            // } else {
            //   await controller.trigger(['session_check'], dialogBot, message);
            // }
          // } // [DEV]
        });
        // job.stop(); // [DEV]
      }
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
};
