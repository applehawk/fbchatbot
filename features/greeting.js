'use strict';

const {
  GREETING_1,
  GREETING_2,
  GREETING_3,
  // GREETING_4,
  // GREETING_5,
} = require('../constants.js');

module.exports = async (controller) => {
  const GREETING_ID = 'GREETING_ID';
  const ONBOARDING_ID = 'ONBOARDING_ID';

  const greeting = controller.dialogSet.dialogs[GREETING_ID];

  // greeting.before('getstarted_payload', async (bot, message) => {
  //   console.log('before:', message);
  //   // const userId = `facebook/conversations/${message.user}-${message.user}/`;
  //   // await bot.controller.storage.delete([userId]);
  // });

  try {
    // send a greeting
    await greeting.ask({
      text: GREETING_1,
      quick_replies: [{
        title: 'Yes! How it works? 🤔',
        payload: 'Yes! How it works?',
      }],
    }, async (response, convo, bot, message) => {
      // console.log(message);
      await controller.trigger(['mark_seen'], bot, message);
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

    await greeting.ask({
      text: GREETING_2,
      quick_replies: [{
        title: 'Cool! I am ready!',
        payload: 'GREETING_2',
      }],
    }, async (response, convo, bot, message) => {
      await controller.trigger(['mark_seen'], bot, message);
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

    await greeting.ask({
      text: GREETING_3,
      quick_replies: [{
        title: 'Let’s do it! 👍',
        payload: 'Let’s do it! 👍',
      }],
    }, async (response, convo, bot, message) => {
      await controller.trigger(['mark_seen'], bot, message);
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

    // await greeting.ask({
    //   text: GREETING_5,
    //   quick_replies: [{
    //     title: 'Go 🚀',
    //     payload: 'Go 🚀',
    //   }],
    // }, async (response, convo, bot, message) => {
    //   // const regexp = new RegExp(/(\s|\d)+?/gius);
    //   if (response === 'Go 🚀'/* && !regexp.test(response)*/) {
    //     message.value = 'Step 4 Click on Go';
    //     await controller.trigger(['ANALYTICS_EVENT'], bot, message);
    //     await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
    //     await convo.stop();
    //   } else {
    //     await convo.repeat();
    //   }
    // });

    await greeting.after(async (results, bot) => {
      await controller.trigger(['mark_seen'], bot, results);
      if (results.text === 'getstarted_payload' || results === 'getstarted_payload' || results === 'Get Started') {
        await controller.trigger(['start'], bot, results);
        return;
      }
      const context = bot.getConfig('context');
      const activity = context._activity;
      const _userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
      const userId = `facebook/conversations/${_userId}-${_userId}/`;
      await bot.controller.storage.delete([userId]);
      await controller.trigger(['sender_action_typing'], bot, { options: { recipient: results.sender } });
      await bot.replaceDialog(ONBOARDING_ID, { username: results.username, profilePic: results.profilePic });
    });
  } catch(error) {
    console.error(error);
  }
};
