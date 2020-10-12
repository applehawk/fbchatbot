'use strict';

const CronJob = require('cron').CronJob;

const { getUserContextProperties, resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  // return;
  /**
   * #BEGIN Scheduling Automation
   */
  const { storage } = controller;

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

  // if (date < time) {
    const job = new CronJob(
      // Seconds: 0-59
      // Minutes: 0-59
      // Hours: 0-23
      // Day of Month: 1-31
      // Months: 0-11 (Jan-Dec)
      // Day of Week: 0-6 (Sun-Sat)

      // '0 0 12 * * 1', // [PROD]
      // '0 0 */1 * * *', // [STAGING]
      '0 0 * * * *', // [TEST]
      // time,
      async () => { // [OK]
        await storage.connect({
          debug: true,
          keepAlive: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        const docs = await storage.Collection.find({ // [OK]
          $and: [
            { 'state.community': { $exists: true } },
            // {
            //   $or: [
            //     { 'state.new_user': true },
            //     { 'state.skip': false },
            //   ],
            // },
          ],
        });

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
        console.log('\n[scheduling_match.js:79]: users', count);

        const jobNextTime = new Date(Date.now() + job._timeout._idleTimeout).toLocaleString();

        if (count) {
          const times = [];
          let usersList = Object.values(users);

          const task = async () => {
            const user = usersList.shift();

            if (!!user) {
              const { id, state } = user;
            // if (id === '3049377188434960') {
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

              const start = Date.now();
              if (state.ready_to_conversation === 'ready') {
                const dialogBot = await controller.spawn(id);
                await dialogBot.startConversationWithUser(id);

                let senderProperties = await getUserContextProperties(
                  controller,
                  dialogBot,
                  message
                );

                const userId = `facebook/conversations/${id}-${id}/`;
                await storage.delete([userId]);
                await dialogBot.cancelAllDialogs();

                Object.assign(message, { ...message, senderProperties });

                await controller.trigger(
                  ['match'],
                  dialogBot,
                  message
                );

                await message.senderProperties.userState.saveChanges(message.senderProperties.context);

                message.senderProperties = await message.senderProperties.userState.load(message.senderProperties.context);

                const recipient = usersList.find((user) => {
                  return user.id === message.senderProperties.conversation_with;
                });

                const recipientIndex = usersList.indexOf(recipient);

                if (recipientIndex > -1) {
                  usersList.splice(recipientIndex, 1);
                }

                message.senderProperties = null;
                senderProperties = null;
              }

              const finish = /*parseFloat((*/Date.now() - start/*) / 1e3).toFixed(3)*/;
              times[times.length] = finish;

              console.log(
                '[scheduling_match.js usersList]',
                usersList.length,
                parseFloat(finish / 1e3).toFixed(3),
                'sec'
              );

              if (!usersList.length) {
                const allTimes = Object.values(times).reduce((accum = 0, value) => {
                  accum += value;
                  return accum;
                });
                const averangeTime = parseInt(allTimes / times.length);
                console.log(
                  '\n[scheduling_match.js NEXT]: job start at:',
                  jobNextTime,
                  'avg:', averangeTime, 'ms',
                  '[min]:', Math.min(...times),
                  '[max]:', Math.max(...times),
                  '[all]:', parseFloat(allTimes / 1000 / 60).toFixed(3), 'min',
                  '(', times.length, ')'
                );
                return;
              }
              await task();
            // }
            }
          };

          await task();
        }

        console.log('\n[scheduling_match.js NEXT]: job start at:', jobNextTime);
      },
      null,
      false,
      'Europe/Moscow'
    );
    // Use this if the 4th param is default value(false)
    job.start();
    console.log(
      'scheduling_match job start at:',
      new Date(Date.now() + job._timeout._idleTimeout).toLocaleString()
    );
  // } else {
  //   return;
  // }
  /**
   * #END Scheduling Automation
   */
};
