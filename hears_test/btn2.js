const { communityDict, askCommunityStr } = require('../constants.js');

module.exports = (controller) => {
  controller.hears('btn2', ['message', 'direct_message'], async (bot, message) => {
    const context = bot.getConfig('context');

    const activity = context._activity;
    const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
    const api = await controller.adapter.getAPI(activity);

    const options = {
      recipient: {
        id: userId,
      },
      message: {
        attachment: {
          type: 'template',
          text: askCommunityStr,
          payload: {
            template_type: 'generic',
            elements: {
            buttons: [
              { type: 'postback',
                title: communityDict[0],
                payload: 0 },
              { type: 'postback',
                title: communityDict[1],
                payload: 1 },
              { type: 'postback',
                title: communityDict[2],
                payload: 2 },
              { type: 'postback',
                title: communityDict[3],
                payload: 3 }/*
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
              ],
            },
          },
        },
      },
    };

    try {
      const result = await api.callAPI('/me/messages', 'POST', options);
      console.log(result);
    } catch(error) {
      console.log(error);
    }

    // bot.say(options, async (answerText, conversation, bot, message) => {
    // });
  });
};
