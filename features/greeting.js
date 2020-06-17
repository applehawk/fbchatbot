'use strict';

const {
  GREETING_1,
  GREETING_2,
  GREETING_3,
  GREETING_4,
  GREETING_5,
} = require('../constants.js');

module.exports = async (controller) => {
  const GREETING_ID = 'GREETING_ID';
  const ONBOARDING_ID = 'ONBOARDING_ID';

  const greeting = controller.dialogSet.dialogs[GREETING_ID];

  try {
    // send a greeting
    await greeting.ask({
      text: GREETING_1,
      quick_replies: [{
        title: 'Tell me more 🤔',
        payload: 'Tell me more 🤔',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'Tell me more 🤔'/* && !regexp.test(response)*/) {
        message.value = 'Step 1';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say(GREETING_2);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      } else {
        await convo.repeat();
      }
    });

    await greeting.ask({
      text: GREETING_3,
      quick_replies: [{
        title: 'I got it 👍',
        payload: 'I got it 👍',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'I got it 👍'/* && !regexp.test(response)*/) {
        message.value = 'Step 2';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say(GREETING_4);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      } else {
        await convo.repeat();
      }
    });

    await greeting.ask({
      text: GREETING_5,
      quick_replies: [{
        title: 'Go 🚀',
        payload: 'Go 🚀',
      }],
    }, async (response, convo, bot, message) => {
      // const regexp = new RegExp(/(\s|\d)+?/gius);
      if (response === 'Go 🚀'/* && !regexp.test(response)*/) {
        message.value = 'Step 3';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await convo.stop();
      } else {
        await convo.repeat();
      }
    });

    await greeting.after(async (results, bot) => {
      await bot.beginDialog(ONBOARDING_ID, { username: results.username, profilePic: results.profilePic });
    });
  } catch(error) {
    console.error(error);
  }
};
