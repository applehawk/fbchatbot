const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const askUsernameStr = 'What is your name?';
const sayUsernameStr = `Great! Your name is {{vars.username}}`;
const askFacebookUrlStr = `Fine. Could you share with me a link to your Facebook profile?

It needs for connection with partners. We will send the link to your partner for scheduling the call.

Where you can find the link?

For Facebook Messenger: go to your profile, this is where the chat list is, copy the profile link and send it to the dialogue.

If you use a web browser:
1) open in a new Facebook.com and go to your profile page
2) copy the link from the address bar and send it to the dialogue.)`;

const askCityFromStr = `It was not easy, but we did it! 😀

Now tell me where are you from?
(Country and city)`;

const askEnglishStr = 'Ok. What about English speaking? Choose your English level, it will help us to choose the suited person for the call.'
const englishLevelDict = {
    Elementary: 'Elementary',
    PreIntermediate: 'Pre-Intermediate',
    Intermediate: 'Intermediate',
    Advanced: 'Advanced',
};

const professionAsk = `Next step:
What are you doing?

Tell us about your work, company, project or startup you are involved in.

For example, I'm a web designer in the Spanish game design studio or I am a marketer in the fintech project.`;

module.exports = function(controller) {
    const ONBOARDING_ID = 'ONBOARDING_ID'
    let onboarding = new BotkitConversation(ONBOARDING_ID, controller);

    // user state properties
    const userState = new UserState(controller.storage);
    let nameProperty = userState.createProperty("username");
    let countryCityProperty = userState.createProperty("country_city");
    let professionProperty = userState.createProperty("profession");
    let englishLevelProperty = userState.createProperty("english_level");

    // ask a question, store the responses
    onboarding.ask(askUsernameStr, async(answerText, convo, bot, message) => {
        let boxContext = bot.getConfig('context');
        await nameProperty.set(boxContext, answerText);
    }, {key: 'username'});
    //onboarding.say(sayUsernameStr);
    //onboarding.ask(askFacebookUrlStr, async(answerText, convo, bot, message) => {
    //}, 'facebook_url');
    onboarding.ask(askCityFromStr, async(asnwerText, convo, bot, message) => {
        let boxContext = bot.getConfig('context');
        await countryCityProperty.set(boxContext, asnwerText);
    }, {key: 'country_city'});
    onboarding.ask(professionAsk, async(answerText, convo, bot, message) => {
        let botContext = bot.getConfig('context');
        await professionProperty.set(botContext, answerText);

    }, {key: 'profession'});

    onboarding.ask({text: askEnglishStr,
        quick_replies: [{
          content_type: 'text',
          title: englishLevelDict.Elementary,
          payload: englishLevelDict.Elementary,
        }, {
          content_type: 'text',
          title: englishLevelDict.PreIntermediate,
          payload: englishLevelDict.PreIntermediate,
        }, {
          content_type: 'text',
          title: englishLevelDict.Intermediate,
          payload: englishLevelDict.Intermediate,
        }, {
            content_type: 'text',
            title: englishLevelDict.Advanced,
            payload: englishLevelDict.Advanced,
        }],
      }, async(answerText, conversation, bot, message) => {

        let botContext = bot.getConfig('context');
        englishLevelProperty.set(botContext, answerText);

        conversation.stop();
      }, {key: 'english_level'});

    onboarding.after(async(results, bot) => {
        bot.say(`Great {{vars.results.username}} ! We know about you next things:
        
    What are you doing -> {{vars.results.profession}}
    What is your level of English -> {{vars.results.english_level}}
    You have a Facebook page :), here is it-> {{vars.results.facebook_url}}
        
    Oh yes, I completely forgot. You are from {{vars.results.country_city}}`);
    
        console.log(results);
        if (results._status === 'completed') {
            let botContext = bot.getConfig('context');
            await userState.saveChanges(botContext)
        }
    
    });

    controller.addDialog(onboarding);
}