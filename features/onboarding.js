'use strict';

const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const {
    // askFacebookUrlStr, // [?]
    // askUsernameStr,
    // askAboutExpertIn,

    askAboutYouself1,
    askAboutYouself2,

    askCityFromStr,
    askCommunityStr,
    askEnglishStr,

    askProfessionStr1,
    askProfessionStr2,
    askProfessionStr3,

    askWhoIntroduceIn1,
    askWhoIntroduceIn2,
    askWhoIntroduceIn3,
    askWhoIntroduceIn4,

    communityDict,
    englishLevelDict,
} = require('../constants.js');

module.exports = async (controller) => {
    // Temporary user's data
    let data = {};

    const ONBOARDING_ID = 'ONBOARDING_ID';
    const onboarding = controller.dialogSet.dialogs[ONBOARDING_ID];

    const COMMUNITY_DIALOG_ID = 'COMMUNITY_DIALOG';
    const community = new BotkitConversation(COMMUNITY_DIALOG_ID, controller);

    await community.ask({
        text: 'Tell us which community you are interested in.',
    }, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has Community (Other): ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'community' });

    await community.after(async (results, bot) => { // [OK]
        Object.assign(data, results);
    });

    controller.addDialog(community);

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

    // // #BEGIN User Name
    // // ask a question, store the responses
    // onboarding.ask({
    //     text: askUsernameStr,
    // }, async (answerText, convo, bot, message) => {
    //     try {
    //         data = { ...convo.vars };
    //         console.log(`User has name: ${answerText}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'username' });
    // // #END User Name

    // // [?][?][?]
    // // #BEGIN Facebook URL
    // await onboarding.ask({
    //     text: askFacebookUrlStr,
    // }, async (answerText, convo, bot, message) => {
    //     try {
    //         console.log(`Facebook url: ${answerText}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'facebook_url' });
    // // #END Facebook URL

    // #BEGIN Location
    await onboarding.ask({
        text: askCityFromStr,
    }, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has location: ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'location' });
    // #END Location

    // #BEGIN Profession
    await onboarding.say({
        text: askProfessionStr1,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.say({
        text: askProfessionStr2,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.ask({
        text: askProfessionStr3,
    }, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has Profession: ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'profession' });
    // #END Profession

    // #BEGIN English Level
    await onboarding.ask({
        text: askEnglishStr,
        quick_replies: [ ...getDictItems(englishLevelDict) ],
    }, async (answerText, convo, bot, message) => {
        try {
            console.log(`User has EnglishLevel: ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'english_level' });
    // #END English Level

    // #BEGIN About Yourself
    await onboarding.say({
        text: askAboutYouself1,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.ask({
        text: askAboutYouself2,
    }, async (answerText, convo, bot, message) => {
        try {
            console.log(`User about yourself: ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'about_yourself' });
    // #END About Yourself

    // // #BEGIN About ExpertIn
    // await onboarding.ask({
    //     text: askAboutExpertIn,
    // }, async (answerText, convo, bot, message) => {
    //     try {
    //         console.log(`User is an expert in: ${answerText}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'about_expertin' });
    // // #END About ExportIn

    // // #BEGIN Community
    await onboarding.addQuestion({
        text: askCommunityStr,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, [
        {
            default: true,
            handler: async (answerText, convo, bot, message) => {
                try {
                    console.log(`User has Community: ${answerText}`);
                } catch(error) {
                    console.error(error);
                }
            },
        },
        {
            pattern: 'Other',
            handler: async (answerText, convo, bot, message) => {
                try {
                    await bot.beginDialog(COMMUNITY_DIALOG_ID, { ...convo.vars });
                } catch(error) {
                    console.error(error);
                }
            },
        }
    ], { key: 'community' });

    // #BEGIN About ExpertIn
    await onboarding.say({
        text: askWhoIntroduceIn1,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.say({
        text: askWhoIntroduceIn2,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.say({
        text: askWhoIntroduceIn3,
        delay: 1000,
    }, async (answerText, convo, bot, message) => {
    });

    await onboarding.ask({
        text: askWhoIntroduceIn4,
    }, async (answerText, convo, bot, message) => {
        try {
            // Put user's temporary data back into the convo.vars
            Object.assign(convo.vars, data);
            console.log(`User who introduceIn: ${answerText}`);
        } catch(error) {
            console.error(error);
        }
    }, { key: 'who_introducein' });
    // #END About ExportIn

    // Inform to the user about self
    await onboarding.ask({ // [OK]
        text: `😎 Great. Look at the result:

{{{vars.username}}}
{{{vars.facebook_url}}}
Location: {{{vars.location}}}
English Level: {{{vars.english_level}}}
Community: {{{vars.community}}}
Work: {{{vars.profession}}}
I have interested in: {{{vars.about_yourself}}}

I can introduce to: {{{vars.who_introducein}}}`,
        quick_replies: [{
          content_type: 'text',
          title: 'All right. Let’s go!',
          payload: 'All right. Let’s go!',
        }],
    }, async (answerText, convo, bot, message) => {
        await convo.stop();
    });

    await onboarding.after(async (results, bot) => { // [OK]
        try {
            // user state properties
            const userState = new UserState(controller.storage);

            const context = bot.getConfig('context');

            const usernameProperty = userState.createProperty('username');
            const profilePicProperty = userState.createProperty('profile_pic');
            // const facebookURLProperty = userState.createProperty('facebook_url');
            const communityProperty = userState.createProperty('community');
            const englishLevelProperty = userState.createProperty('english_level');
            const locationProperty = userState.createProperty('location');
            const professionProperty = userState.createProperty('profession');
            const aboutYouselfProperty = userState.createProperty('about_yourself');
            // const aboutExpertInProperty = userState.createProperty('about_expertin');
            const aboutWhoIntroduceIn = userState.createProperty('who_introducein');
            const readyToConversationProperty = userState.createProperty('ready_to_conversation');
            const recentUsersProperty = userState.createProperty('recent_users');

            await communityProperty.set(context, communityDict.indexOf(results.community));
            await locationProperty.set(context, results.location);
            await englishLevelProperty.set(
                context,
                englishLevelDict.indexOf(results.english_level)
            );
            // await facebookURLProperty.set(context, results.facebook_url);
            await usernameProperty.set(context, results.username);
            await profilePicProperty.set(context, results.profilePic);
            await professionProperty.set(context, results.profession);
            await aboutYouselfProperty.set(context, results.about_yourself);
            // await aboutExpertInProperty.set(context, results.about_expertin);
            await aboutWhoIntroduceIn.set(context, results.who_introducein);
            await readyToConversationProperty.set(context, 'ready'); // results.ready_to_conversation
            await recentUsersProperty.set(context, []);

            // Save User's Info
            await userState.saveChanges(context);

            await bot.say('Thank you! Unfortunately the service in a testing mode. We are planning to go public in a month. But don’t be upset! We will give you 1 month fo free since the service will be started. Also we will notify you when it will happen.');

            // Sending Gif
            const activity = context._activity;

            const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
            const options = {
                recipient: {
                    id: userId,
                },
                message: {
                    attachment: {
                        type: "image",
                        payload: {
                            url: "https://media.giphy.com/media/StXP3dSGStWDBvsCjF/giphy.gif",
                            is_reusable: true,
                        }
                    }
                }
            };
            await bot.api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.error(error);
        };
    });
};
