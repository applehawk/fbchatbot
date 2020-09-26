'use strict';

const CronJob = require('cron').CronJob;

const { getUserContextProperties, resetUserContextProperties } = require(`../helpers.js`);

module.exports = async (controller) => {
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller.storage;

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

      // '0 0 12-15 * * 1', // [PROD]
      // '0 0 */1 * * *', // [STAGING]
      '0 */1 * * * *', // [TEST]
      // time,
      async () => {
        await storage.connect({
          useNewUrlParser: true,
          debug: true,
          keepAlive: true,
        });

        const docs = await storage.Collection.find({ // [OK]
          // 'state.ready_to_conversation': { $eq: 'ready' },
          'state.community': { $exists: true },
          $or: [
            { 'state.skip': { $exists: false } },
            { 'state.skip': false },
          ],
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
        console.log('[scheduling_match.js:71]: users', count);

        const jobNextTime = new Date(Date.now() + job._timeout._idleTimeout).toLocaleString();

        if (count) {
          let usersList = Object.values(users);
          usersList.forEach(async ({ id, state }, i) => {
            // for await (const { id, state } of usersList) {
            if (id === '3049377188434960') {
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
                const user = usersList.find((user) => user.id === id);
                const userIndex = usersList.indexOf(user);

                if (userIndex > -1) {
                  const start = Date.now();
                  const dialogBot = await controller.spawn(id);
                  await dialogBot.startConversationWithUser(id);

                  await resetUserContextProperties(controller, dialogBot, message);
                  // await controller.trigger(['reset'], dialogBot, message);

                  let senderProperties = await getUserContextProperties(
                    controller,
                    dialogBot,
                    message
                  );

                  if (senderProperties.ready_to_conversation === 'ready') {
                    const userId = `facebook/conversations/${id}-${id}/`;
                    await storage.delete([userId]);
                    await dialogBot.cancelAllDialogs();

                    Object.assign(message, { ...message, senderProperties });

                    console.log('>>>>> scheduling_match: message:\tbefore:', message.senderProperties);

                    await controller.trigger(
                      ['match_and_update'],
                      dialogBot,
                      message
                    );

                    await senderProperties.userState.saveChanges(message.senderProperties.context);

                    senderProperties = await getUserContextProperties(
                      controller,
                      dialogBot,
                      message
                    );

                    console.log('>>>>> scheduling_match: message:\tafter:', senderProperties);

                    const recipient = usersList.find(
                      (user) => user.id === senderProperties.conversation_with
                    );
                    const recipientIndex = usersList.indexOf(recipient);

                    if (recipientIndex > -1) {
                      usersList.splice(recipientIndex, 1);
                    }
                  }

                  usersList.splice(userIndex, 1);
                  senderProperties = null;

                  const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);

                  console.log(
                    '[scheduling_match.js usersList]',
                    usersList.length,
                    finish
                  );

                  if (!usersList.length) {
                    console.log(
                      '[scheduling_match.js NEXT]: job start at:',
                      jobNextTime
                    );
                  }
                } else {
                  console.log(
                    '[scheduling_match.js:153 userIndex]: user not found',
                    i,
                    id,
                    userIndex
                  );
                }
                //   // await resetUserContextProperties(controller, dialogBot, message);
                // await controller.trigger(['reset'], dialogBot, message);
                // }, 500 * i);
              }, 5000 * i);
            }
            // }
          });
        }
        console.log('[scheduling_match.js NEXT]: job start at:', jobNextTime);
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
