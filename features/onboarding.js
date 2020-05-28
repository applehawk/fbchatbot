'use strict';

const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');
<<<<<<< HEAD

const { communityDict, englishLevelDict, askUsernameStr,
    askCityFromStr, askEnglishStr, professionAsk, askCommunityStr,
     } = require('../constants.js');

module.exports = function(controller) {
=======
const { FacebookAPI } = require('botbuilder-adapter-facebook');

const {
    askCityFromStr,
    askCommunityStr,
    askEnglishStr,
    askFacebookUrlStr,
    askProfessionStr,
    askUsernameStr,
    communityDict,
    englishLevelDict,
    sayUsernameStr,
} = require('../constants.js');

module.exports = (controller) => {
>>>>>>> e4a5e7cca8994d128e225a76bf8f973f332de5bb
    const ONBOARDING_ID = 'ONBOARDING_ID'
    let onboarding = controller.dialogSet.dialogs[ONBOARDING_ID];

    controller.hears("btn", ['message','direct_message'], async(bot,message) => {
        var options = {
            attachment: {
                type:"template",
                payload:{
                    template_type: "button",
                    text: askCommunityStr,
                    buttons:[
                                {
                                'type':'postback',
                                'title':communityDict.IT,
                                'payload':0,
                                },
                                {
                                'type':'postback',
                                'title':communityDict.Startups,
                                'payload':1,
                                },
                                {
                                'type':'postback',
                                'title':communityDict.Design,
                                'payload':2,
                                },
                                {
                                'type':'postback',
                                'title':communityDict.Sport,
                                'payload':3,
                                },/*
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
    
        bot.say(options, async(answerText, conversation, bot, message) => {
        });
    })

    // user state properties
    const userState = new UserState(controller.storage);
    const communityProperty = userState.createProperty('community');
    const englishLevelProperty = userState.createProperty('english_level');
    const locationProperty = userState.createProperty('location');
    const nameProperty = userState.createProperty('username');
    const professionProperty = userState.createProperty('profession');

    const api = new FacebookAPI(
        process.env.FACEBOOK_ACCESS_TOKEN,
        process.env.FACEBOOK_APP_SECRET);

    const getDictItems = (dict) => {
        const items = [];
        Object.keys(dict).forEach((key, i) => {
            items.push({
                content_type: 'text',
                title: dict[key],
                payload: i,
            });
        });
        return items;
    };

    // #BEGIN User Name
    // ask a question, store the responses
    onboarding.ask(askUsernameStr, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has name ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'username'});

    onboarding.say(sayUsernameStr);
    // #END User Name

    //onboarding.ask(askFacebookUrlStr, async (answerText, convo, bot, message) => {
    //}, 'facebook_url');

    // #BEGIN Location
    onboarding.ask(askCityFromStr, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has city ${answerText}`);
        } catch(error) {
            console.log(error);
        }
<<<<<<< HEAD
    }, {key: 'country_city'});

    onboarding.ask(professionAsk, async(answerText, convo, bot, message) => {
=======
    }, {key: 'location'});
    // #END Location

    // #BEGIN English Level
    onboarding.ask({ text: askEnglishStr,
        quick_replies: [ ...getDictItems(englishLevelDict) ],
    }, async (answerText, conversation, bot, message) => {
>>>>>>> e4a5e7cca8994d128e225a76bf8f973f332de5bb
        try {
            console.log(`User has EnglishLevel: ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, { key: 'english_level'});
    // #END English Level

<<<<<<< HEAD
      onboarding.ask({text: askEnglishStr,
        quick_replies: [{
          content_type: 'text',
          title: englishLevelDict.Elementary,
          payload: 0,
        }, {
          content_type: 'text',
          title: englishLevelDict.PreIntermediate,
          payload: 1,
        }, {
          content_type: 'text',
          title: englishLevelDict.Intermediate,
          payload: 2,
        }, {
            content_type: 'text',
            title: englishLevelDict.Advanced,
            payload: 3,
        }],
      }, async(answerText, conversation, bot, message) => {
=======
    // #BEGIN Community
    onboarding.ask({ text: askCommunityStr,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, async (answerText, conversation, bot, message) => {
>>>>>>> e4a5e7cca8994d128e225a76bf8f973f332de5bb
        try {
            console.log(`User has Community: ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, { key: 'community'});
    // #END Community

    // #BEGIN Profession
    onboarding.ask(askProfessionStr,
        async (answerText, convo, bot, message) => {
            try {
                console.log(`User has Profession ${answerText}`);
                await convo.stop();
            } catch(error) {
                console.log(error);
            }
    }, {key: 'profession'});
    // #END Profession

    onboarding.after(async (results, bot) => {
        try {
            console.log(results);

            const context = bot.getConfig('context');

            await communityProperty.set(context, communityDict.indexOf(results.community));
            await locationProperty.set(context, results.location);
            await englishLevelProperty.set(
                context,
                englishLevelDict.indexOf(results.english_level)
            );
            await nameProperty.set(context, results.username);
            await professionProperty.set(context, results.profession);

            const readyToConversationProperty = userState.createProperty('ready_to_conversation');
            const recentUsersProperty = userState.createProperty('recent_users');

            await readyToConversationProperty.set(context, 'ready'); // results.ready_to_conversation
            await recentUsersProperty.set(context, []);

            // Save User's Info
            await userState.saveChanges(context);

            // Inform to the user about self
            await bot.say(`Great ${results.username}! We know about you next things:

Your level of English is: ${results.english_level}
You work in: ${results.community}
You work as: ${results.profession}
You have a Facebook page :), here is it: ${results.facebook_url}

Oh yes, I completely forgot. You are from ${results.location}
`);
        } catch(error) {
            console.log(error);
        };

    });
};
