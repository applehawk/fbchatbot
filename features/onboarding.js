const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

// const askUsernameStr = 'What is your name?';
// const sayUsernameStr = 'Great! Your name is {{vars.username}}';
// const askFacebookUrlStr = `Fine. Could you share with me a link to your Facebook profile?

// It needs for connection with partners. We will send the link to your partner for scheduling the call.

// Where you can find the link?

// For Facebook Messenger: go to your profile, this is where the chat list is, copy the profile link and send it to the dialogue.

// If you use a web browser:
// 1) open in a new Facebook.com and go to your profile page
// 2) copy the link from the address bar and send it to the dialogue.)`;

// const askCityFromStr = `It was not easy, but we did it! 😀

// Now tell me where are you from?
// (Country and city)`;

// const askEnglishStr = 'Ok. What about English speaking? Choose your English level, it will help us to choose the suited person for the call.'
// const englishLevelDict = {
//     Elementary: 'Elementary',
//     PreIntermediate: 'Pre-Intermediate',
//     Intermediate: 'Intermediate',
//     Advanced: 'Advanced',
// };

// const professionAsk = `Next step:
// What are you doing?

// Tell us about your work, company, project or startup you are involved in.

// For example, I'm a web designer in the Spanish game design studio or I am a marketer in the fintech project.`;

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


module.exports = function(controller) {
    const ONBOARDING_ID = 'ONBOARDING_ID'
    let onboarding = controller.dialogSet.dialogs[ONBOARDING_ID];

    // user state properties
    const userState = new UserState(controller.storage);
    let communityProperty = userState.createProperty("community");
    let countryCityProperty = userState.createProperty("country_city");
    let englishLevelProperty = userState.createProperty("english_level");
    let nameProperty = userState.createProperty("username");
    let professionProperty = userState.createProperty("profession");
    let readyToConversationProperty = userState.createProperty("ready_to_conversation");

    const getEnglishLevelDict = () => {
        const levels = [];
        Object.keys(englishLevelDict).forEach((key, i) => {
            levels.push({
                content_type: 'text',
                title: englishLevelDict[key],
                payload: i,
            });
        });
        return levels;
    };

    const getCommunityDict = () => {
        const communities = [];
        Object.keys(communityDict).forEach((key, i) => {
            communities.push({
                content_type: 'text',
                title: communityDict[key],
                payload: i,
            });
        });
        return communities;
    };

    // ask a question, store the responses
    onboarding.ask(askUsernameStr, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has name ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'username'});

    onboarding.say(sayUsernameStr);
    //onboarding.ask(askFacebookUrlStr, async (answerText, convo, bot, message) => {
    //}, 'facebook_url');
    onboarding.ask(askCityFromStr, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has city ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, {key: 'country_city'});

    // onboarding.ask({ text: askEnglishStr,
    //     quick_replies: [{ // [TODO] Refactoring and automation
    //       content_type: 'text',
    //       title: englishLevelDict.elementary,
    //       payload: 0,
    //     }, {
    //       content_type: 'text',
    //       title: englishLevelDict.preIntermediate,
    //       payload: 1,
    //     }, {
    //       content_type: 'text',
    //       title: englishLevelDict.intermediate,
    //       payload: 2,
    //     }, {
    //         content_type: 'text',
    //         title: englishLevelDict.advanced,
    //         payload: 3,
    //     }],
    // }, async (answerText, conversation, bot, message) => {
    //     try {
    //         console.log(`User has EnglishLevel: ${answerText}`);
    //     } catch(error) {
    //         console.log(error);
    //     }
    // }, { key: 'english_level'});

    try {
        onboarding.ask({ text: askEnglishStr,
            quick_replies: [ ...getEnglishLevelDict() ],
        }, async (answerText, conversation, bot, message) => {
            try {
                console.log(`User has EnglishLevel: ${answerText}`);
            } catch(error) {
                console.log(error);
            }
        }, { key: 'english_level'});
    } catch(error) {
        console.log(error);
    }

    onboarding.ask({ text: askCommunityStr,
        quick_replies: [ ...getCommunityDict() ],
    }, async (answerText, conversation, bot, message) => {
        try {
            console.log(`User has Community: ${answerText}`);
        } catch(error) {
            console.log(error);
        }
    }, { key: 'community'});

    onboarding.ask(askProfessionStr,
       async (answerText, convo, bot, message) => {
            try {
                console.log(`User has Profession ${answerText}`);
                await conversation.stop();
            } catch(error) {
                console.log(error);
            }
    }, {key: 'profession'});

    onboarding.after(async (results, bot) => {
        try {
              await bot.say(`Great ${results.username} ! We know about you next things:

Your level of English: ${results.english_level}
You work in: ${results.community}
You work as: ${results.profession}
You have a Facebook page :), here is it: ${results.facebook_url}

Oh yes, I completely forgot. You are from ${results.country_city}`);

                console.log(results);

                const botContext = bot.getConfig('context');
                await communityProperty.set(botContext, results.community);
                await countryCityProperty.set(botContext, results.country_city);
                await englishLevelProperty.set(
                    botContext,
                    results.english_level.key
                );
                await nameProperty.set(botContext, results.username);
                await professionProperty.set(botContext, results.profession);
                await readyToConversationProperty.set(botContext, 'ready'); // results.ready_to_conversation
                await userState.saveChanges(botContext);
            } catch(error) {
            console.log(error);
        };

    });
}
