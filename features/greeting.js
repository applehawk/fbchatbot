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

  greeting.before('getstarted_payload', async (bot, message) => {
    console.log('before:', message);
    // const userId = `facebook/conversations/${message.user}-${message.user}/`;
    // await bot.controller.storage.delete([userId]);
  });

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
        message.value = 'Step 1 Click on Tell me more';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say(GREETING_2);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      } else if (response === 'getstarted_payload') {
        // console.log('convo message:', message);
        Object.assign(convo.vars, message);
        await convo.stop();
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
        message.value = 'Step 2 Click on I got it';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say(GREETING_4);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      } else if (response === 'getstarted_payload') {
        Object.assign(convo.vars, message);
        await convo.stop();
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
        message.value = 'Step 3 Click on Go';
        await controller.trigger(['ANALYTICS_EVENT'], bot, message);
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await convo.stop();
      } else if (response === 'getstarted_payload') {
        Object.assign(convo.vars, message);
        await convo.stop();
      } else {
        await convo.repeat();
      }
    });

    await greeting.after(async (results, bot) => {
      if (results.text === 'getstarted_payload') {
        await controller.trigger(['start'], bot, results);
        return;
      }
      const context = bot.getConfig('context');
      const activity = context._activity;
      const _userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
      const userId = `facebook/conversations/${_userId}-${_userId}/`;
      await bot.controller.storage.delete([userId]);
      await bot.replaceDialog(ONBOARDING_ID, { username: results.username, profilePic: results.profilePic });
    });
  } catch(error) {
    console.error(error);
  }
};
