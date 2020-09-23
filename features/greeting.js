'use strict';

const {
  GREETING_1,
  GREETING_2,
  GREETING_3,
} = require('../constants.js');

module.exports = async (controller) => {
  const DIALOG_GREETING_ID = 'DIALOG_GREETING_ID';
  const DIALOG_ONBOARDING_ID = 'DIALOG_ONBOARDING_ID';

  const dialog = controller.dialogSet.dialogs[DIALOG_GREETING_ID];

  try {
    await dialog.ask({
      text: GREETING_1,
      quick_replies: [{
        title: 'Yes! How it works? 🤔',
        payload: 'Yes! How it works?',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'getstarted_payload' || message.text === 'getstarted_payload' || response === 'Get Started') {
          Object.assign(convo.vars, message);
          await convo.stop();
      } else {
        if (response === 'Yes! How it works? 🤔' /* && !regexp.test(response)*/) {
          message.value = 'Step 1 Click on Tell me how it works';
          await controller.trigger(['ANALYTICS_EVENT'], bot, message);
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        } else {
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
          await convo.repeat();
        }
      }
    });

    await dialog.ask({
      text: GREETING_2,
      quick_replies: [{
        title: 'Cool! I am ready!',
        payload: 'GREETING_2',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'getstarted_payload' || message.text === 'getstarted_payload' || response === 'Get Started') {
        Object.assign(convo.vars, message);
        await convo.stop();
      } else {
        if (response === 'Cool! I am ready!' /* && !regexp.test(response)*/) {
          message.value = 'Step 2 Click on How to start';
          await controller.trigger(['ANALYTICS_EVENT'], bot, message);
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        } else {
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
          await convo.repeat();
        }
      }
    });

    await dialog.ask({
      text: GREETING_3,
      quick_replies: [{
        title: 'Let’s do it! 👍',
        payload: 'Let’s do it! 👍',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'getstarted_payload' || message.text === 'getstarted_payload' || response === 'Get Started') {
        Object.assign(convo.vars, message);
        await convo.stop();
      } else {
        if (response === 'Let’s do it! 👍' /* && !regexp.test(response)*/) {
          message.value = 'Step 3 Click on Lets do it';
          await controller.trigger(['ANALYTICS_EVENT'], bot, message);
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
          await convo.repeat();
        }
      }
    });

    await dialog.after(async (results, bot) => {
      if (results.text === 'getstarted_payload' || results === 'getstarted_payload' || results === 'Get Started') {
        await controller.trigger(['start'], bot, results);
        return;
      }
      await controller.trigger(['sender_action_typing'], bot, { options: { recipient: results.sender } });
      await bot.replaceDialog(DIALOG_ONBOARDING_ID, { username: results.username, profile_pic: results.profile_pic });
    });
  } catch(error) {
    console.error('[greeting.js:96 ERROR]:', error);
  }
};
