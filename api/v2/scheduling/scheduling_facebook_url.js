'use strict';

const CronJob = require('cron').CronJob;

module.exports = async (controller) => {
  /**
   * #BEGIN Scheduling Automation
   */
  const { storage } = controller;

  const job = new CronJob(
    // Seconds: 0-59
    // Minutes: 0-59
    // Hours: 0-23
    // Day of Month: 1-31
    // Months: 0-11 (Jan-Dec)
    // Day of Week: 0-6 (Sun-Sat)
    '0 30 10-11 * * 5-6',
    // '0 */10 * * * *',
    // '0 */5 * * * *',
    async () => {
      await storage.connect();

      const docs = await storage.Collection.find({
        'state.community': { $exists: true },
        'state.facebook_url': { $exists: false }
      });

      const users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
        const id = _id.match(/\/(\d+)\/?$/);
        if (!!id) {
          accum[_id] = { id: id[1], state };
        }
        return accum;
      }, []);

      const count = Object.keys(users).length;
      console.log('[scheduling_facebook_url.js:38]:', count);
      const jobNextTime = new Date(Date.now() + job._timeout._idleTimeout).toLocaleString();

      if (count) {
        let usersList = Object.values(users);

        const task = async () => {
          const user = userList.shift();
          if (!!user) {
            const { id } = user;

            const message = {
              user: id,
              text:
                'We found that some information about you is missing from your profile.\n\nDo you want to add data now?',
              quick_replies: [
                { payload: 'scheduling_facebook_url_yes', title: 'Yes' },
                { payload: 'scheduling_facebook_url_no', title: 'No' },
              ],
              channel: id,
              messaging_type: 'MESSAGE_TAG',
              recipient: { id },
              sender: { id },
              tag: 'ACCOUNT_UPDATE',
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
                  sender: { id },
                },
              },
            };

            await storage.delete([`facebook/conversations/${id}-${id}/`]);

            const dialogBot = await controller.spawn(id);
            await dialogBot.cancelAllDialogs();
            await dialogBot.startConversationWithUser(id);

            await controller.trigger(['start_dialog'], dialogBot, message);
          }
          if (!usersList.length) {
            console.log('[scheduling_facebook_url.js NEXT]: job start at:', jobNextTime);
            return;
          }
          await task();
        };

        await task();
      }

      console.log('[scheduling_facebook_url.js NEXT]: job start at:', jobNextTime);
    },
    null,
    false,
    'Europe/Moscow'
  );
  // Use this if the 4th param is default value(false)
  job.start();
  console.log(
    'scheduling_facebook_url job start at:',
    new Date(Date.now() + job._timeout._idleTimeout).toLocaleString()
  );
  /**
   * #END Scheduling Automation
   */
};
