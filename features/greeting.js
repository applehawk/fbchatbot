'use strict';

const { BotkitConversation } = require('botkit');

module.exports = (controller) => {
    const GREETING_ID = 'GREETING_ID'
    const ONBOARDING_ID = 'ONBOARDING_ID'

    let greeting = controller.dialogSet.dialogs[GREETING_ID];
    // send a greeting
    greeting.addMessage('Version 1.0.1')
    greeting.addMessage(`Hi! 👋

    We are the (not)Random English an international online platform for training business English skills through a friendly networking format.

    Every Monday and Thursday we will offer you for conversation an interesting person, selected following your interests among other participants.

    We establish a simple system, first of all, you should share with us some information about yourself, your needs and your knowledge that might be useful for our community. It allows other people before the call to know what topics it will be interesting to discuss with you.

    Let me ask you some questions and we will create your profile that will be available to other participants`);

    greeting.ask({
        text: "Here we go?",
        quick_replies: [{
          content_type: 'text',
          title: 'Go!',
          payload: 'Go!',
        }],
      }, function(response, convo) {
        //convo.stop();
      });

    greeting.after(async(results, bot) => {
        bot.beginDialog(ONBOARDING_ID);
    });
};
