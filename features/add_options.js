'use strict';

const CronJob = require('cron').CronJob;
const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');
const {
  ONBOARDING_FB_URL_1,
  ONBOARDING_FB_URL_2,
  ONBOARDING_FB_URL_3,
} = require('../constants.js');

module.exports = async (controller) => {
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  const FB_DIALOG_ID = 'FB_DIALOG_ID';
  const dialog = new BotkitConversation(FB_DIALOG_ID, controller);

  await dialog.before(async (bot, message) => {
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
    await bot.say(ONBOARDING_FB_URL_1);
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  });

  await dialog.ask({
    text: ONBOARDING_FB_URL_3,
  }, async (response, convo, bot, message) => {
    Object.assign(convo.vars, message);
    if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
      await convo.stop();
    } else {
      const regexp = new RegExp(/^(https?):\/\/(www\.|m\.)?(facebook\.com)(\/[^\s]+)$/i);
      if (!!response && !!response.match(regexp)) {
        console.log(`User Facebook profile link: ${response}`);
        message.value = 'Step 5 Facebook Profile';
        controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await convo.stop();
      } else {
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say(ONBOARDING_FB_URL_2);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await convo.repeat();
      }
    }
  }, { key: 'facebook_url' });

  await dialog.after(async (results, bot) => { // [OK]
    try {
      if (results.text === 'getstarted_payload') {
        await controller.trigger(['start'], bot, results);
        return;
      }
      /**
       * User state properties
       */
      const userState = new UserState(controller.storage);

      const context = bot.getConfig('context');

      const facebook_url_property = userState.createProperty('facebook_url');
      await facebook_url_property.set(context, results.facebook_url);

      /**
       * Save User's Info
       */
      await userState.saveChanges(context);
      results.value = undefined;
    } catch(error) {
      console.error('[add_options.js:71 ERROR]:', error);
    };
  });

  controller.addDialog(dialog);

  const job = new CronJob(
    // Seconds: 0-59
    // Minutes: 0-59
    // Hours: 0-23
    // Day of Month: 1-31
    // Months: 0-11 (Jan-Dec)
    // Day of Week: 0-6 (Sun-Sat)
    '0 0 11 * * *',
    // '0 */10 * * * *',
    // '0 */5 * * * *',
    async () => {
      await storage.connect();

      const docs = await storage.Collection.find({ "state.facebook_url": { "$exists": false } });

      const users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
        const id = _id.match(/\/(\d+)\/?$/);
        if (!!id) {
          accum[_id] = { id: id[1], state };
        }
        return accum;
      }, []);

      const count = Object.keys(users).length;
      console.log('[add_options.js:108]:', count);

      if (count) {
        let usersList = Object.values(users);
        usersList.forEach(async ({ id, state }, i) => {
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
                sender: { id },
              },
            },
          };

          const task = setTimeout(async () => {
            const dialogBot = await controller.spawn(id);
            await dialogBot.startConversationWithUser(id);

            const senderIndex = Object.keys(users).indexOf(`facebook/users/${id}/`);

            const userId = `facebook/conversations/${id}-${id}/`;
            await storage.delete([userId]);
            await dialogBot.cancelAllDialogs();

            controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient: message.sender } });
            await dialogBot.replaceDialog(FB_DIALOG_ID);

            usersList.splice(senderIndex, 1);
          }, 2000 * i);
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
