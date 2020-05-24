const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const { communityDict, englishLevelDict, askUsernameStr,
    askCityFromStr, askEnglishStr, professionAsk, askCommunityStr,
     } = require('../constants.js');

module.exports = function(controller) {
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
    let nameProperty = userState.createProperty("username");
    let countryCityProperty = userState.createProperty("country_city");
    let professionProperty = userState.createProperty("profession");
    let englishLevelProperty = userState.createProperty("english_level");

    // ask a question, store the responses
    onboarding.ask(askUsernameStr, async(answerText, convo, bot, message) => {
        try {
            console.log(`User has name ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'username'});

    onboarding.say('Great! Your name is {{vars.username}}');
    //onboarding.ask(askFacebookUrlStr, async(answerText, convo, bot, message) => {
    //}, 'facebook_url');
    onboarding.ask(askCityFromStr, async(answerText, convo, bot, message) => {
        try {
            console.log(`User has city ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'country_city'});

    onboarding.ask(professionAsk, async(answerText, convo, bot, message) => {
        try {
            console.log(`User has Profession ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'profession'});

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
        try {
            console.log(`User has EnglishLevel: ${answerText}`);
            await conversation.stop();
        } catch(error) {
            console.log(error);
        }
      }, {key: 'english_level'});

    onboarding.after(async(results, bot) => {
        try {
            await bot.say(`Great ${results.username} ! We know about you next things:
        
    What are you doing -> ${results.profession}
    What is your level of English -> ${results.english_level}
    You have a Facebook page :), here is it-> ${results.facebook_url}
        
    Oh yes, I completely forgot. You are from ${results.country_city}`);
    
            console.log(results);

            let botContext = bot.getConfig('context');
            await nameProperty.set(botContext, results.username);
            await countryCityProperty.set(botContext, results.country_city);
            await professionProperty.set(botContext, results.profession);

            await englishLevelProperty.set(botContext, results.english_level.key);
            await userState.saveChanges(botContext)
        } catch(error) {
            console.log(error);
        };
    
    });
}