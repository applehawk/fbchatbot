'use strict';

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
  const FB_DIALOG_ID = 'DIALOG_FACEBOOK_URL_ID';
  const dialog = controller.dialogSet.dialogs[FB_DIALOG_ID];

  await dialog.before(async (bot, message) => {
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
    await bot.say(ONBOARDING_FB_URL_1);
    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  });

  await dialog.ask({
    text: ONBOARDING_FB_URL_3,
  }, async (response, convo, bot, message) => {
    if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
      Object.assign(convo.vars, message);
      await convo.stop();
    } else {
      const regexp = new RegExp(/^(https?):\/\/(www\.|m\.)?(facebook\.com)(\/[^\s]+)$/i);
      if (!!response && !!response.match(regexp)) {
        console.log(`User Facebook profile link: ${response}`);
        message.value = 'Step 5 Facebook Profile';
        controller.trigger(['ANALYTICS_EVENT'], bot, message);
        Object.assign(convo.vars, message);
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
    } catch (error) {
      console.error('[add_options.js:68 ERROR]:', error);
    };
  });
};
