'use strict';

const { UserState } = require('botbuilder');

const {
    ONBOARDING_LOCATION,
    ONBOARDING_PROFESSION_1,
    ONBOARDING_PROFESSION_2,
    ONBOARDING_PROFESSION_3,
    ONBOARDING_ENGLISH_LEVEL,
    ONBOARDING_ABOUT_YOURSELF_1,
    ONBOARDING_ABOUT_YOURSELF_2,
    ONBOARDING_COMMUNITY,
    ONBOARDING_WHO_INTRODUCE_IN_1,
    ONBOARDING_WHO_INTRODUCE_IN_2,
    ONBOARDING_WHO_INTRODUCE_IN_3,
    ONBOARDING_WHO_INTRODUCE_IN_4,
    ONBOARDING_RESULTS,
    ONBOARDING_THANKS,
    ONBOARDING_FB_URL_1,
    ONBOARDING_FB_URL_2,
    ONBOARDING_FB_URL_3,

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
    let ONBOARDING_FB_URL = `${ONBOARDING_FB_URL_1}\n\n${ONBOARDING_FB_URL_3}`;

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
                payload: i,
                title: dict[key],
            });
        });
        return items;
    };

    // #BEGIN Location
    await onboarding.ask({
        text: ONBOARDING_LOCATION,
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
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say(ONBOARDING_FB_URL_1);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        // } else {
        //     await convo.repeat();
        // }
        }
    }, { key: 'location' });
    // #END Location

    // #BEGIN Facebook URL
    await onboarding.ask({ // [OK]
        text: ONBOARDING_FB_URL_3,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            const regexp = new RegExp(/^(https?):\/\/((www\.)|(m.))?(facebook\.com)(\/[^\s]+)$/i);
            if (!!response.match(regexp)) {
                console.log(`User Facebook profile link: ${response}`);
                message.value = 'Step 5 Facebook Propfile';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                // #BEGIN Profession
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say(ONBOARDING_PROFESSION_1);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say(ONBOARDING_PROFESSION_2);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            } else {
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say(ONBOARDING_FB_URL_2);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await convo.repeat();
            }
        }
    }, { key: 'facebook_url' });
    // #END Facebook URL

    // #BEGIN Profession
    await onboarding.ask({
        text: ONBOARDING_PROFESSION_3,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
        // const regexp = new RegExp(/(\s|\d)+?/gius);
        // if (!regexp.test(response)) {
            message.value = 'Step 6 Professional activities';
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
        text: ONBOARDING_ENGLISH_LEVEL,
        quick_replies: [ ...getDictItems(englishLevelDict) ],
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            if (englishLevelDict.includes(response)) {
                message.value = 'Step 7 English level';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                console.log(`User has EnglishLevel: ${response}`);
                // #BEGIN About Yourself
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say(ONBOARDING_ABOUT_YOURSELF_1);
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            } else {
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await convo.repeat();
            }
        }
    }, { key: 'english_level' });
    // #END English Level

    // #BEGIN About Yourself
    await onboarding.ask({
        text: ONBOARDING_ABOUT_YOURSELF_2,
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            console.log(`User about yourself: ${response}`);
            message.value = 'Step 8 Passion';
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
        text: ONBOARDING_COMMUNITY,
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
        text: ONBOARDING_COMMUNITY,
        quick_replies: [ ...getDictItems(communityDict) ],
    }, async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
            Object.assign(convo.vars, message);
            await convo.stop();
        } else {
            if (communityDict.includes(response)) {
                console.log(`User has Community: ${response}`);
                message.value = 'Step 9 Community';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                // #BEGIN About ExpertIn

                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_WHO_INTRODUCE_IN_1);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_WHO_INTRODUCE_IN_2);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                //await bot.say(ONBOARDING_WHO_INTRODUCE_IN_3);
                //await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            } else {
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await convo.repeat();
            }
        }
    }, { key: 'community' });
    // #END Community

    // #BEGIN About ExpertIn
    /*
    await onboarding.ask({
        text: ONBOARDING_WHO_INTRODUCE_IN_4,
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
        text: ONBOARDING_RESULTS,
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
                Object.assign(convo.vars, message);
                await convo.stop();
            } else {
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
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

            // const aboutExpertInProperty = userState.createProperty('about_expertin');
            const aboutWhoIntroduceIn = userState.createProperty('who_introducein');
            const aboutYouselfProperty = userState.createProperty('about_yourself');
            const communityProperty = userState.createProperty('community');
            const conversationWithProperty = userState.createProperty('conversation_with');
            const englishLevelProperty = userState.createProperty('english_level');
            const facebookURLProperty = userState.createProperty('facebook_url');
            const locationProperty = userState.createProperty('location');
            const professionProperty = userState.createProperty('profession');
            const profilePicProperty = userState.createProperty('profile_pic');
            const readyToConversationProperty = userState.createProperty('ready_to_conversation');
            const recentUsersProperty = userState.createProperty('recent_users');
            const usernameProperty = userState.createProperty('username');

            // await aboutExpertInProperty.set(context, results.about_expertin);
            await aboutWhoIntroduceIn.set(context, results.who_introducein);
            await aboutYouselfProperty.set(context, results.about_yourself);
            await communityProperty.set(context, communityDict.indexOf(results.community));
            await conversationWithProperty.set(context, 0);
            await englishLevelProperty.set(
                context,
                englishLevelDict.indexOf(results.english_level)
            );
            await facebookURLProperty.set(context, results.facebook_url);
            await locationProperty.set(context, results.location);
            await professionProperty.set(context, results.profession);
            await profilePicProperty.set(context, results.profilePic);
            await readyToConversationProperty.set(context, 'ready'); // results.ready_to_conversation
            await recentUsersProperty.set(context, []);
            await usernameProperty.set(context, results.username);

            /**
             * Save User's Info
             */
            await userState.saveChanges(context);

            const recipient = {
                id: results.sender.id,
            };

            /**
             * #BEGIN Bot typing
             */
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
            await bot.say(ONBOARDING_THANKS);

            // /**
            //  * #BEGIN Bot typing
            //  */
            // await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

            /**
             * Sending Gif
             */
            // const options = {
            //     recipient,
            //     message: {
            //         attachment: {
            //             type: 'image',
            //             payload: {
            //                 // attachment_id: process.env.GIF_END,
            //                 url: GIF_ONBOARDING,
            //                 // is_reusable: true,
            //             },
            //         },
            //     },
            // };
            // await bot.api.callAPI('/me/messages', 'POST', options);

            if (process.env.NODE_ENV !== 'production') { // [OK][*]
                /**
                 * Creating user's menu
                 */
                let payload = {
                    recipient: results.sender,
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
                };

                await controller.trigger(['create_menu'], bot, payload);
            }

            /**
             * Start matching
             */
            results.value = undefined;
            // await controller.trigger(['start_match'], bot, results);
        } catch(error) {
            console.error('[onboarding.js:420 ERROR]:', error);
        };
    });
};
