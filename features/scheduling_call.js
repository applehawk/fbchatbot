'use strict';

const CronJob = require('cron').CronJob;
const {/*  getUserContextProperties,  */ resetUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';
  const storage = controller._config.storage;

  // const date = new Date();
  // const days = date.getDay();
  // const hours = date.getHours();

  // /**
  //  * Get session start time
  //  */
  // // // v1 [OK] Dynamic date
  // // const sessionStart = new Date(days <= 3 ? Date.now() : new Date().setHours(new Date().getHours() - (3 * 24)));

  // // // v2 [OK] Fixed date
  // // const sessionStart = new Date(/* days <= 3 ? new Date().setHours(12, 0, 0) :  */new Date().setHours((7 - days + 3) * 24 + 12, 0, 0));
  // const sessionStart = new Date(
  //   days <= 5
  //     ? new Date().setHours(hours >= 12 ? hours + 1 : 12, 0, 0)
  //     : new Date().setHours((7 - days + 3) * 24 + 12, 0, 0)
  // );

  // // v3 [OK] Custom date
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

  // console.log('scheduling_call job start at:', time.toLocaleString());

  // if (time) {
    const job = new CronJob(
      '0 30 * * * *', // [STAGING]
      // '0 */8 * * * *', // [TEST]
      // time,
      async () => {
        await storage.connect({ useNewUrlParser: true, debug: true, keepAlive: true });

        const docs = await storage.Collection.find({
          "state.ready_to_conversation": { "$eq": "busy" },
          "state.community": { "$exists": true },
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
        console.log('[scheduling_call.js:61]: sessions:', count);

        if (count) {
          let usersList = Object.values(users);
          usersList.forEach(async ({ id, state }, i) => {
            // for await (const { id, state } of usersList) {
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

              const senderIndex = Object.keys(users).indexOf(`facebook/users/${id}/`);

              await resetUserContextProperties(controller, dialogBot, message);

              await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient: message.recipient } });
              dialogBot.replaceDialog(SCHEDULED_A_CALL_ID, { message });

              usersList.splice(senderIndex, 1);
              senderProperties = null;
            }, 3000 * i);
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
