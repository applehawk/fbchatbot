'use strict';

const CronJob = require('cron').CronJob;

module.exports = async (controller) => {
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  const { getUserContextProperties, resetUserContextProperties } = require('../helpers.js');

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

      const docs = await storage.Collection.find({ "state.ready_to_conversation": { "$eq": "ready" } });
      // const docs = await storage.Collection.find({ 'state.ready_to_conversation': 'busy' });
      // const docs = await storage.Collection.find();
      const users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
        if (!!_id.match('facebook/users')) {
          const id = _id.match(/\/(\d+)\/$/)[1];
          if (!!id) {
            accum[_id] = { id, state };
          }
        }
        return accum;
      }, {});

      const count = Object.keys(users).length;
      console.log('users whos ready for conversation:', count);

      if (count) {
        Object.values(users).forEach(async ({ id, state }, i) => {
          // if (i < 10) {
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
                  messaging_type: 'MESSAGE_TAG',
                  tag: 'ACCOUNT_UPDATE',
                  sender: { id },
                },
              },
            };

            const task = setTimeout(async () => {
              const dialogBot = await controller.spawn(id);
              await dialogBot.startConversationWithUser(id);
              const { conversationWith, userName, readyToConversation } = await getUserContextProperties(controller, dialogBot, message);
              if (!dialogBot.hasActiveDialog() && readyToConversation === 'ready') {
                await controller.trigger(['match'], dialogBot, message);
                // const { conversationWith, userName, readyToConversation } = await getUserContextProperties(controller, dialogBot, message);
                // console.log('Scheduling:', userName, readyToConversation, conversationWith);
              } else {
                console.log(id, conversationWith, userName, readyToConversation, 'has dialog:', dialogBot.hasActiveDialog());
              }
              // await resetUserContextProperties(controller, dialogBot, message);
            }, 2000 * i);
          // }
        });
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
