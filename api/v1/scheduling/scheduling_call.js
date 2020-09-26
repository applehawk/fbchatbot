'use strict';

const CronJob = require('cron').CronJob;
const {/*  getUserContextProperties,  */ resetUserContextProperties } = require(`../helpers.js`);

module.exports = async (controller) => {
  const storage = controller.storage;

  // const date = new Date();
  // const days = date.getDay();
  // const scheduledDay = process.env.SCHEDULING_CALL_DAY; // 0-6
  // const hours = date.getHours();

  // /**
  //  * Get session start time
  //  */
  // // // v1 [OK] Dynamic date
  // // const sessionStart = new Date(days <= scheduledDay ? Date.now() : new Date().setHours(new Date().getHours() - (scheduledDay * 24)));

  // // v2 [OK] Fixed date
  // // const sessionStart = new Date(/* days <= scheduledDay ? new Date().setHours(12, 0, 0) :  */new Date().setHours((6 - days + scheduledDay) * 24 + 12, 0, 0));
  // // const sessionStart = new Date(
  // //   days <= scheduledDay
  // //     ? new Date().setHours(hours >= 12 ? hours + 1 : 24 + 12, 0, 0)
  // //     : new Date().setHours((6 - days + scheduledDay) * 24 + 12, 0, 0)
  // // );
  // const sessionStart = new Date(
  //   days <= scheduledDay
  //     ? new Date().setHours((24 * (6 - scheduledDay)) + (hours < 12 ? 12 : hours >= 12 && hours < 15 ? hours + 1 : 12), 0, 0)
  //     : new Date().setHours((6 - days + scheduledDay) * 24 + 12, 0, 0)
  // );

  // // // v3 [OK] Custom date
  // // const sessionStart = new Date(new Date().setHours(12, 0, 0));

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
      '0 0 12-15 * * 3', // [PROD]
      // '0 30 * * * *', // [STAGING]
      // '0 35-59 * * * *', // [TEST]
      // time,
      async () => {
        await storage.connect({ useNewUrlParser: true, debug: true, keepAlive: true });

        const docs = await storage.Collection.find({
          'state.ready_to_conversation': { $eq: 'busy' },
          'state.community': { $exists: true },
        });

        let users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
          if (!!_id.match('facebook/users')) {
            const id = _id.match(/\/(\d+)\/?$/)[1];
            if (!!id) {
              accum[_id] = { id, state };
            }
          }
          return accum;
        }, []);

        let count = Object.keys(users).length;
        console.log('[scheduling_call.js:72]: active sessions:', count);
        const jobNextTime = new Date(Date.now() + job._timeout._idleTimeout).toLocaleString();

        if (count) {
          let usersList = Object.values(users);
          usersList.forEach(async ({ id, state }, i) => {
            const task = setTimeout(async () => {
              const message = {
                user: id,
                text: `Hi! 👋\nHow are you? Have you already had a call with your partner?`,
                quick_replies: [
                  { payload: 'scheduling_call_yes', title: 'Yes I do' },
                  { payload: 'scheduling_call_no', title: 'No' },
                ],
                channel: id,
                messaging_type: 'MESSAGE_TAG',
                recipient: { id },
                sender: { id },
                tag: 'ACCOUNT_UPDATE',
                user: id,
                value: 'Scheduled a call',
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

              const user = usersList.find(user => user.id === id);
              const userIndex = usersList.indexOf(user);

              const start = Date.now();

              const dialogBot = await controller.spawn(id)
              await dialogBot.startConversationWithUser(id);

              await resetUserContextProperties(controller, dialogBot, message);

              await controller.trigger(['start_dialog'], dialogBot, message);
              usersList.splice(userIndex, 1);
              const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);
              console.log('[scheduling_call.js usersList]', usersList.length, finish);
              if (!usersList.length) {
                console.log('[scheduling_call.js NEXT]: job start at:', jobNextTime);
              }
            }, 1000 * i);
          });
        }
        console.log('[scheduling_call.js NEXT]: job start at:', jobNextTime);
      },
      null,
      false,
      'Europe/Moscow'
    );
    // Use this if the 4th param is default value(false)
    job.start();
    console.log(
      'scheduling_call job start at:',
      new Date(Date.now() + job._timeout._idleTimeout).toLocaleString()
    );
  // } else {
  //   return;
  // }
  /**
   * #END Scheduling Automation
   */
};
