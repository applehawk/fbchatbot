const { communityDict, askCommunityStr } = require('../constants.js');

module.exports = (controller) => {
  controller.hears('btn2', ['message','direct_message'], async (bot, message) => {
    const context = bot.getConfig('context');

    const activity = context._activity;
    const api = await controller.adapter.getAPI(activity);

    const options = {
      attachment: {
        type: 'template',
        payload:{
          template_type: 'button',
          text: askCommunityStr,
          buttons:[
            { 'type': 'postback',
              'title': communityDict.IT,
              'payload': 0 },
            { 'type': 'postback',
              'title': communityDict.Startups,
              'payload': 1 },
            { 'type': 'postback',
              'title': communityDict.Design,
              'payload': 2 },
            { 'type': 'postback',
              'title': communityDict.Sport,
              'payload': 3 },/*
            {
            'type':'postback',
            'title':communityDict.Networking,
            'payload':communityDict.Networking
            },
            {
            'type':'postback',
            'title':communityDict.EnglishJobInterview,
            'payload':communityDict.EnglishJobInterview
            },
            {
            'type':'postback',
            'title':communityDict.EnglishPresentations,
            'payload':communityDict.EnglishPresentations
            },*/
          ]
        }
      }
    };

    const result = await api.callAPI('/me/messages', 'POST', options);
    console.log(result);

    // bot.say(options, async (answerText, conversation, bot, message) => {
    // });
  });
};
