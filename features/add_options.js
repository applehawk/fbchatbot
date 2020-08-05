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
  // return;
  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  const FB_DIALOG_ID = 'FB_DIALOG_ID';
  const dialog = new BotkitConversation(FB_DIALOG_ID, controller);

  await dialog.before(async (bot, message) => {
    console.log('bot:', bot, 'message:', message);
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
    await bot.say(ONBOARDING_FB_URL_1);
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  });

  await dialog.ask({
    text: ONBOARDING_FB_URL_3,
  }, async (response, convo, bot, message) => {
    Object.assign(convo.vars, message);
    await controller.trigger(['mark_seen'], bot, message);
    if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
      await convo.stop();
    } else {
      const regexp = new RegExp(/^(https?):\/\/(www\.)?(facebook\.com)(\/[^\s]+)$/i);
      if (!!response.match(regexp)) {
        console.log(`User Facebook profile link: ${response}`);
        message.value = 'Step 5 Facebook Propfile';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
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
    await controller.trigger(['mark_seen'], bot, results);
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

      const facebookURLProperty = userState.createProperty('facebook_url');
      await facebookURLProperty.set(context, results.facebook_url);

      /**
       * Save User's Info
       */
      await userState.saveChanges(context);
      results.value = undefined;
    } catch(error) {
      console.error('[add_options.js:75 ERROR]:', error);
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
    // '00 00 12 * * 1,4',
    '0 0 11 * * *',
    async () => {
      const bot = await controller.spawn();
      const { id: botId } = await bot.api.callAPI('/me', 'GET');

      await storage.connect();

      const docs = await storage.Collection.find();
      const users = (await docs.toArray()).reduce((accum, { _id, state }) => { // [OK]
        if (!!_id.match('facebook/users') && state.facebook_url === undefined) {
          const id = _id.match(/\/(\d+)\/$/)[1];
          if (!!id) {
            accum[_id] = { id, state };
          }
        }
        return accum;
      }, {});

      if (Object.keys(users).length) {
        Object.values(users).forEach(async ({ id, state }, i) => {
          // if (i < 2) { // [DEV]
            const bot = await controller.spawn(id);
            await bot.startConversationWithUser(id);

            if (!state.facebook_url && !bot.hasActiveDialog()) {

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

              const task = setTimeout(async () => {
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.beginDialog(FB_DIALOG_ID);
              }, 1000 * i);
            }
          // } // [DEV]
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
