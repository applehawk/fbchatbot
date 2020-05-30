'use strict';

// const { UserState } = require('botbuilder');

module.exports = (controller) => {
  const GREETING_ID = 'GREETING_ID';
  const ONBOARDING_ID = 'ONBOARDING_ID';

  const greeting = controller.dialogSet.dialogs[GREETING_ID];

  // controller.on('facebook_postback', async (message, bot) => {
  //   // user state properties
  //   const userState = new UserState(controller.storage);
  //   console.log(userState, controller, bot, message);
  //   const context = await bot.getConfig('context');

  //   const userNameProperty = userState.createProperty('username');
  //   const userPicProperty = userState.createProperty('user_pic');

  //   let userName = await userNameProperty.get(context);
  //   let userPic = await userPicProperty.get(context);

  //   console.log(userName, userPic);
  // });

  // send a greeting
  greeting.addMessage('Version 1.0.1');

  greeting.ask({
    text: `Hi! 👋

We are the (not)Random English. An international online platform that is intended for training business English skills through a friendly networking format.`,
    quick_replies: [{
      content_type: 'text',
      title: 'Tell me how it works',
      payload: 'Tell me how it works',
    }],
  }, async (response, convo, bot) => {
  });

  greeting.ask({
    text: `Every Monday and Thursday we will offer you an interesting person for a conversation, selected following your interests among other participants.

First of all, you should share with us some information about yourself, your needs and your knowledge. It allows other people to know what topics it will be interesting to discuss with you before the call.`,
    quick_replies: [{
      content_type: 'text',
      title: 'I got it',
      payload: 'I got it',
    }],
  }, async (response, convo, bot) => {
  });

  greeting.ask({
    text: `Let me ask you some questions and we will create your profile that will be available to other participants.

Here we go?`,
    quick_replies: [{
      content_type: 'text',
      title: 'All right. Let’s go!',
      payload: 'All right. Let’s go!',
    }],
  }, async (response, convo, bot) => {
    bot.say('Thank you! Unfortunately the service in a testing mode. We are planning to go public in a month. But don’t be upset! We will give you 1 month fo free since the service will be started. Also we will notify you when it will happen. Thank you!');
    // const userState = new UserState(controller.storage);
    // const context = bot.getConfig('context');
    // const activity = context._activity;
    // const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

    // try {
    //   const userNameProperty = userState.createProperty('username');
    //   const userPicProperty = userState.createProperty('user_pic');
    //   let userName = await userNameProperty.get(context);
    //   let userPic = await userPicProperty.get(context);

    //   const api = await controller.adapter.getAPI(activity);
    //   const url = `/${userId}`;

    //   const response = await api.callAPI(url, 'GET');
    //   const result = JSON.stringify(response, null, 2);

    //   userName = `${result.first_name} ${result.last_name}`;
    //   userPic = result.user_pic;

    //   await userNameProperty.set(context, userName);
    //   await userPicProperty.set(context, userPic);
    // } catch(error) {
    //   console.log(error);
    // }
  });

  greeting.after(async (results, bot) => {
    await bot.beginDialog(ONBOARDING_ID);
  });
};
