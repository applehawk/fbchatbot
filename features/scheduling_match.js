'use strict';

const CronJob = require('cron').CronJob;

const { getUserContextProperties, resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  // const date = new Date();
  // const days = date.getDay();
  // const scheduledDay = process.env.SCHEDULING_MATCH_DAY; // 0-6
  // const hours = date.getHours();

  // /**
  //  * Get session start time
  //  */
  // const sessionStart = new Date(/* days <= scheduledDay ? new Date().setHours(12, 0, 0) :  */new Date().setHours((7 - days + scheduledDay) * 24 + 12, 0, 0));

  // /**
  //  * Time correction
  //  */
  // const correctionHours = date >= sessionStart ? 12 : (sessionStart.getDay() - days) * 24;

  // /**
  //  * Set session end time
  //  */
  // const sessionEnd = new Date(new Date().setHours(hours <= correctionHours ? hours + (correctionHours - hours) : correctionHours, 0, 0));
  // const time = date <= sessionEnd ? sessionEnd : sessionStart;

  // console.log('scheduling_match job start at:', time.toLocaleString());

  // if (date < time) {
    const job = new CronJob(
      // Seconds: 0-59
      // Minutes: 0-59
      // Hours: 0-23
      // Day of Month: 1-31
      // Months: 0-11 (Jan-Dec)
      // Day of Week: 0-6 (Sun-Sat)

      // '0 0 12-15 * * 1', // [PROD]
      // '0 0 */1 * * *', // [STAGING]
      '0 0 * * * *', // [TEST]
      // time,
      async () => {
        await storage.connect({
          useNewUrlParser: true,
          debug: true,
          keepAlive: true,
        });

        const docs = await storage.Collection.find({ // [OK]
          // 'state.ready_to_conversation': { $eq: 'ready' },
          'state.ready_to_conversation': { $eq: 'busy' },
          'state.community': { $exists: true },
        });

        // [OK]
        let users = (await docs.toArray()).reduce((accum, { _id, state }) => {
          if (!!_id.match('facebook/users')) {
            const id = _id.match(/\/(\d+)\/?$/)[1];
            if (!!id) {
              accum[_id] = { id, state };
            }
          }
          return accum;
        }, []);

        let count = Object.keys(users).length;
        console.log('[scheduling_match.js:73]: users', count);

        if (count) {
          let usersList = Object.values(users);
          usersList.forEach(async ({ id, state }, i) => {
            // for await (const { id, state } of usersList) {
            // if (i < 5) {
            const message = {
              channel: id,
              message: { text: '' },
              messaging_type: 'MESSAGE_TAG',
              recipient: { id },
              sender: { id },
              tag: 'ACCOUNT_UPDATE',
              text: '',
              user: id,
              value: undefined,
              reference: {
                activityId: undefined,
                user: { id, name: id },
                conversation: { id },
              },
              incoming_message: {
                channelId: 'facebook',
                conversation: { id },
                from: { id, name: id },
                recipient: { id, name: id },
                channelData: {
                  messaging_type: 'MESSAGE_TAG',
                  tag: 'ACCOUNT_UPDATE',
                  sender: { id },
                },
              },
            };

            const task = setTimeout(async () => {
              const dialogBot = await controller.spawn(id);
              await dialogBot.startConversationWithUser(id);

              // let senderProperties = await getUserContextProperties(
              //   controller,
              //   dialogBot,
              //   message
              // );

              // if (senderProperties.ready_to_conversation === 'ready') {
              //   const userId = `facebook/conversations/${id}-${id}/`;
              //   await storage.delete([userId]);
              //   await dialogBot.cancelAllDialogs();

              //   await controller.trigger(['match'], dialogBot, message);
              //   senderProperties = await getUserContextProperties(
              //     controller,
              //     dialogBot,
              //     message
              //   );

              //   const recipientIndex = Object.keys(users).indexOf(
              //     `facebook/users/${senderProperties.conversation_with}/`
              //   );

              //   if (recipientIndex > -1) {
              //     usersList.splice(recipientIndex, 1);
              //   }
              // } else if (senderProperties.community === undefined) {
              //   let payload = { id, username: senderProperties.username };
              //   console.warning(
              //     '[scheduling_match.js:124 WARNING]:',
              //     payload,
              //     'has not completed the onboarding'
              //   );
              //   payload = null;
              // }

              // const senderIndex = Object.keys(users).indexOf(`facebook/users/${id}/`);
              // usersList.splice(senderIndex, 1);
              // senderProperties = null;

                await resetUserContextProperties(controller, dialogBot, message);
                // await controller.trigger(['reset'], dialogBot, message);
              }, 1000 * i);
              // }, 2000);
            // }, 3000 * i);
            // }
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
  // } else {
  //   return;
  // }
  /**
   * #END Scheduling Automation
   */
};
