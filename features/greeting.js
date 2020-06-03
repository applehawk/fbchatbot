'use strict';

module.exports = async (controller) => {
  const GREETING_ID = 'GREETING_ID';
  const ONBOARDING_ID = 'ONBOARDING_ID';

  const greeting = controller.dialogSet.dialogs[GREETING_ID];

  try {
    // send a greeting
    await greeting.ask({
      text: `Hi {{{vars.username}}}! 👋

We are the RandomEnglish. An international online platform that is intended for training business English skills through a friendly networking format.`,
      quick_replies: [{
        content_type: 'text',
        title: 'Tell me how it works 🤔',
        payload: 'Tell me how it works 🤔',
      }],
    }, async (response, convo, bot) => {
    });

    await greeting.say({
      text: `Every Monday and Thursday we will offer you an interesting person for a conversation, selected following your interests among other participants.`
    }, async (response, convo, bot) => {
    });

    await greeting.ask({
      text: `First of all, you should share with us some information about yourself, your needs and your knowledge. It allows other people to know what topics it will be interesting to discuss with you before the call.`,
      quick_replies: [{
        content_type: 'text',
        title: 'I got it 👍',
        payload: 'I got it 👍',
      }],
    }, async (response, convo, bot) => {
    });

    await greeting.say({
      text: `Let me ask you some questions and we will create your profile that will be available to other participants. 🤓`,
    }, async (response, convo, bot) => {
    });

    await greeting.ask({
      text: `Here we go?`,
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
