'use strict';

// const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const {
    askCityFromStr,
    askCommunityStr,
    askEnglishStr,
    askAboutYouself,
    askAboutExpertIn,
    askWhoIntroduceIn,
    askFacebookUrlStr,
    askProfessionStr,
    askUsernameStr,
    communityDict,
    englishLevelDict,
    sayUsernameStr,
} = require('../constants.js');

module.exports = (controller) => {
    const ONBOARDING_ID = 'ONBOARDING_ID'
    const onboarding = controller.dialogSet.dialogs[ONBOARDING_ID];

    // controller.hears('btn', ['message', 'direct_message'], async (bot, message) => {
    //     const options = {
    //         attachment: {
    //             type:"template",
    //             payload:{
    //                 template_type: "button",
    //                 text: askCommunityStr,
    //                 buttons:[
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.IT,
    //                             'payload':0,
    //                             },
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.Startups,
    //                             'payload':1,
    //                             },
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.Design,
    //                             'payload':2,
    //                             },
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.Sport,
    //                             'payload':3,
    //                             },/*
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.Networking,
    //                             'payload':communityDict.Networking
    //                             },
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.EnglishJobInterview,
    //                             'payload':communityDict.EnglishJobInterview
    //                             },
    //                             {
    //                             'type':'postback',
    //                             'title':communityDict.EnglishPresentations,
    //                             'payload':communityDict.EnglishPresentations
    //                             },*/
    //                 ]
    //             }
    //         }
    //     };

    //     bot.say(options, async(answerText, conversation, bot, message) => {
    //     });
    // });

    // user state properties
    const userState = new UserState(controller.storage);

    // console.log(userState, controller);
    // const context = await controller.getConfig('context');

    // const userNameProperty = userState.createProperty('username');
    // const userPicProperty = userState.createProperty('user_pic');

    // let userName = await userNameProperty.get(context);
    // let userPic = await userPicProperty.get(context);

    // console.log(userName, userPic);
    // return;

    const communityProperty = userState.createProperty('community');
    const englishLevelProperty = userState.createProperty('english_level');
    const locationProperty = userState.createProperty('location');

    const nameProperty = userState.createProperty('username');
    const professionProperty = userState.createProperty('profession');
    const aboutYouselfProperty = userState.createProperty('about_yourself');
    const aboutExpertInProperty = userState.createProperty('about_expertin');
    const aboutWhoIntroduceIn = userState.createProperty('who_introducein');

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

    // onboarding.say(sayUsernameStr);
    // #END User Name

    //onboarding.ask(askFacebookUrlStr, async (answerText, convo, bot, message) => {
    //}, 'facebook_url');

    // #BEGIN Location
    onboarding.ask(askCityFromStr, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has location ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'location'});
    // #END Location

    // #BEGIN Profession
    onboarding.ask(askProfessionStr,
        async (answerText, convo, bot, message) => {
            try {
                console.log(`User has Profession ${answerText}`);
            } catch(error) {
                console.log(error);
            }
    }, {key: 'profession'});
    // #END Profession

    // #BEGIN English Level
    onboarding.ask({ text: askEnglishStr,
        quick_replies: [ ...getDictItems(englishLevelDict) ],
    }, async (answerText, conversation, bot, message) => {
        try {
            console.log(`User has EnglishLevel: ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, { key: 'english_level'});
    // #END English Level

    // #BEGIN About Yourself
    onboarding.ask(askAboutYouself,
        async (answerText, convo, bot, message) => {
        try {
            console.log(`User about yourself ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'about_yourself'});
    // #END About Yourself

    // #BEGIN About ExpertIn
    onboarding.ask(askAboutExpertIn,
        async (answerText, convo, bot, message) => {
        try {
            console.log(`User about yourself ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'about_expertin'});
    // #END About ExportIn

    // #BEGIN Community
    onboarding.ask({ text: askCommunityStr,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, async (answerText, conversation, bot, message) => {
        try {
            console.log(`User has Community: ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, { key: 'community'});
    // #END Community

    // #BEGIN About ExpertIn
    onboarding.ask(askWhoIntroduceIn,
        async (answerText, convo, bot, message) => {
        try {
            console.log(`User who introduceIn: ${answerText}`);
            await convo.stop();
        } catch(error) {
            console.log(error);
        }
    }, {key: 'who_introducein'});
    // #END About ExportIn

    onboarding.ask({
        text: 'Thank you! Unfortunately the service in a testing mode. We are planning to go public in a month. But don’t be upset! We will give you 1 month fo free since the service will be started. Also we will notify you when it will happen. Thank you!',
        quick_replies: [{
          content_type: 'text',
          title: 'Ok',
          payload: 'Ok',
        }],
        }, async (response, convo, bot) => {
    });

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
            await aboutYouselfProperty.set(context, results.about_yourself);
            await aboutExpertInProperty.set(context, results.about_expertin);
            await aboutWhoIntroduceIn.set(context, results.who_introducein);

            const readyToConversationProperty = userState.createProperty('ready_to_conversation');
            const recentUsersProperty = userState.createProperty('recent_users');

            await readyToConversationProperty.set(context, 'ready'); // results.ready_to_conversation
            await recentUsersProperty.set(context, []);

            // Save User's Info
            await userState.saveChanges(context);

            // Inform to the user about self
            await bot.say(`Great. Look at the result:
${results.username}
${results.facebook_url}
Location: ${results.location}
English Level: ${results.english_level}
Community:${results.community}
Work: ${results.profession}
How I can help: ${results.about_expertin}
I have interested in: ${results.about_yourself}

I can introduce to: ${results.who_introducein}`);
        } catch(error) {
            console.log(error);
        };

    });
};
