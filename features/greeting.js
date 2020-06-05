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
        content_type: 'text',
        title: 'Tell me more 🤔',
        payload: 'Tell me more 🤔',
      }],
    }, async (response, convo, bot) => {
    });

    await greeting.say({
      text: GREETING_2,
    }, async (response, convo, bot) => {
    });

    await greeting.ask({
      text: GREETING_3,
      quick_replies: [{
        content_type: 'text',
        title: 'I got it 👍',
        payload: 'I got it 👍',
      }],
    }, async (response, convo, bot) => {
    });

    await greeting.say({
      text: GREETING_4,
    }, async (response, convo, bot) => {
    });

    await greeting.ask({
      text: GREETING_5,
      quick_replies: [{
        content_type: 'text',
        title: 'Go 🚀',
        payload: 'Go 🚀',
      }],
    }, async (response, convo, bot) => {
      await convo.stop();
    });

    await greeting.after(async (results, bot) => {
      await bot.beginDialog(ONBOARDING_ID, { username: results.username, profilePic: results.profilePic });
    });
  } catch(error) {
    console.error(error);
  }
};
