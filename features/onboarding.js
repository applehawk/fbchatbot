'use strict';

const { UserState } = require('botbuilder');

const {
    ONBOARDING_1,
    ONBOARDING_2_1,
    ONBOARDING_2_2,
    ONBOARDING_2_3,
    ONBOARDING_3,
    ONBOARDING_4_1,
    ONBOARDING_4_2,
    ONBOARDING_5,
    ONBOARDING_6_1,
    ONBOARDING_6_2,
    ONBOARDING_6_3,
    ONBOARDING_6_4,
    ONBOARDING_7,
    ONBOARDING_8,

    communityDict,
    englishLevelDict,

    GIF_ONBOARDING,
} = require('../constants.js');

module.exports = async (controller) => {
    /**
     * [-] Temporary user's data
     */
    // let data = {};

    const ONBOARDING_ID = 'ONBOARDING_ID';
    const onboarding = controller.dialogSet.dialogs[ONBOARDING_ID];

    // onboarding.before('getstarted_payload', async (bot, message) => {
    //     console.log('before:', message);
    //     // const userId = `facebook/conversations/${message.user}-${message.user}/`;
    //     // await bot.controller.storage.delete([userId]);
    // });

    // [OK][-]
    // const COMMUNITY_DIALOG_ID = 'COMMUNITY_DIALOG';
    // const community = new BotkitConversation(COMMUNITY_DIALOG_ID, controller);

    // await community.ask({
    //     text: 'Tell us which community you are interested in.',
    // }, async (response, convo, bot, message) => {
    //     try {
    //         console.log(`User has Community (Other): ${response}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'community' });

    // await community.after(async (results, bot) => { // [OK]
    //     Object.assign(data, results);
    // });

    // controller.addDialog(community);

    const getDictItems = (dict) => {
        const items = [];
        Object.keys(dict).forEach((key, i) => {
            items.push({
                // content_type: 'text',
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
    // }, async (response, convo, bot, message) => {
    //     try {
    //         data = { ...convo.vars };
    //         console.log(`User has name: ${response}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'username' });
    // // #END User Name

    // // [?][?][?]
    // // #BEGIN Facebook URL
    // await onboarding.ask({
    //     text: askFacebookUrlStr,
    // }, async (response, convo, bot, message) => {
    //     try {
    //         console.log(`Facebook url: ${response}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'facebook_url' });
    // // #END Facebook URL

    // #BEGIN Location
    await onboarding.ask({
        text: ONBOARDING_1,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
        // const regexp = new RegExp(/(\s|\d)+?/gius);
        // if (!regexp.test(response)) {
            console.log(`User has location: ${response}`);
            message.value = 'Step 4 City question';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            // #BEGIN Profession
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say(ONBOARDING_2_1);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say(ONBOARDING_2_2);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        // } else {
        //     await convo.repeat();
        // }
        }
    }, { key: 'location' });
    // #END Location

    // #BEGIN Profession
    await onboarding.ask({
        text: ONBOARDING_2_3,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
        // const regexp = new RegExp(/(\s|\d)+?/gius);
        // if (!regexp.test(response)) {
            console.log('response:', response, bot, message);
            message.value = 'Step 5 Professional activities';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            console.log(`User has Profession: ${response}`);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        // } else {
        //     await convo.repeat();
        // }
        }
    }, { key: 'profession' });
    // #END Profession

    // #BEGIN English Level
    await onboarding.ask({
        text: ONBOARDING_3,
        quick_replies: [ ...getDictItems(englishLevelDict) ],
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            if (englishLevelDict.includes(response)) {
                message.value = 'Step 6 English level';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                console.log(`User has EnglishLevel: ${response}`);
                // #BEGIN About Yourself
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say(ONBOARDING_4_1);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            } else {
                await convo.repeat();
            }
        }
    }, { key: 'english_level' });
    // #END English Level

    // #BEGIN About Yourself
    await onboarding.ask({
        text: ONBOARDING_4_2,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            console.log(`User about yourself: ${response}`);
            message.value = 'Step 7 Passion';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        }
    }, { key: 'about_yourself' });
    // #END About Yourself

    // // #BEGIN About ExpertIn
    // await onboarding.ask({
    //     text: askAboutExpertIn,
    // }, async (response, convo, bot, message) => {
    //     try {
    //         console.log(`User is an expert in: ${response}`);
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }, { key: 'about_expertin' });
    // // #END About ExportIn

    // #BEGIN Community
/*  // [OK][-]
    await onboarding.addQuestion({
        text: ONBOARDING_5,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, [
        {
            default: true,
            handler: async (response, convo, bot, message) => {
                try {
                    console.log(`User has Community: ${response}`);
                } catch(error) {
                    console.error(error);
                }
            },
        },
        {
            pattern: 'Other',
            handler: async (response, convo, bot, message) => {
                try {
                    await bot.beginDialog(COMMUNITY_DIALOG_ID, { ...convo.vars });
                } catch(error) {
                    console.error(error);
                }
            },
        }
    ], { key: 'community' });
*/
    await onboarding.ask({
        text: ONBOARDING_5,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            if (communityDict.includes(response)) {
                console.log(`User has Community: ${response}`);
                message.value = 'Step 8 Community';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                // #BEGIN About ExpertIn

                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_6_1);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_6_2);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_6_3);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            } else {
                await convo.repeat();
            }
        }
    }, { key: 'community' });
    // #END Community

    // #BEGIN About ExpertIn
    /*
    await onboarding.ask({
        text: ONBOARDING_6_4,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            console.log(`User who introduceIn: ${response}`);
            message.value = 'Step 9 Someone introduce';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        }
    }, { key: 'who_introducein' });*/
    // #END About ExpertIn

    /**
     * Inform to the user about self
     */
    await onboarding.ask({ // [OK]
        text: ONBOARDING_7,
        quick_replies: [{
            title: 'All right. Let’s go!',
            payload: 'All right. Let’s go!',
        }],
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            if (response === 'All right. Let’s go!') {
                message.value = 'Finish Onboarding';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                if (process.env.NODE_ENV !== 'production') {
                    // await controller.trigger(['start_match'], bot, message);
                }
                Object.assign(convo.vars, message);
                await convo.stop();
            } else {
                await convo.repeat();
            }
        }
    });

    await onboarding.after(async (results, bot) => { // [OK]
        await controller.trigger(['mark_seen'], bot, results);
        try {
            if (results.text === 'getstarted_payload') {
                await controller.trigger(['start'], bot, results);
                return;
            }
            /**
             * User state properties
             */
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

            /**
             * Save User's Info
             */
            await userState.saveChanges(context);

            // const activity = context._activity;
            // const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

            const recipient = {
                // id: userId,
                id: results.sender.id,
            };

            /**
             * #BEGIN Bot typing
             */
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

            await bot.say(ONBOARDING_8);

            /**
             * #BEGIN Bot typing
             */
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

            /**
             * Sending Gif
             */
            const options = {
                recipient,
                message: {
                    attachment: {
                        type: 'image',
                        payload: {
                            // attachment_id: process.env.GIF_END,
                            url: GIF_ONBOARDING,
                            // is_reusable: true,
                        },
                    },
                },
            };
            await bot.api.callAPI('/me/messages', 'POST', options);

            /**
             * Start matching
             */
            results.value = undefined;
            await controller.trigger(['start_match'], bot, results);

            if (process.env.NODE_ENV !== 'production') {
                /**
                 * Creating user's menu
                 */
                const menu = {
                    recipient,
                    psid: results.sender.id,
                    persistent_menu: [
                        {
                            locale: 'default',
                            composer_input_disabled: false,
                            call_to_actions: [
                                {
                                    type: 'postback',
                                    title: '🗣 Match',
                                    payload: 'match',
                                },
                                {
                                    type: 'postback',
                                    title: '👤 Profile',
                                    payload: 'me',
                                },
                                {
                                    type: 'postback',
                                    title: '❔ Help',
                                    payload: 'help',
                                },
                            ],
                        }
                    ],
                };

                await bot.api.callAPI('/me/custom_user_settings', 'POST', menu);
            }
        } catch(error) {
            console.error('[onboarding.js:437 ERROR]:', error);
        };
    });
};
