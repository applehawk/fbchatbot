'use strict';

module.exports = Object.freeze({
    englishLevelDict: [
        'Elementary',
        'Pre-Intermediate',
        'Intermediate',
        'Advanced'
    ],
    communityDict: [
        'IT/Startups',
        'Business',
        'Design',
        'Sport',
        'Networking',
        'English practice'
        // 'Other'
    ],

    // greeting.js
    GREETING_1: `Hi {{{vars.username}}}! 👋

We are the Random English. An international online platform that is intended for training business English skills through a friendly networking format.

Are you interested in practicing English?`,

    GREETING_2: `Every Monday and Thursday we will offer you an interesting person for a conversation, selected following your interests among other participants. Are you interested?`,
    GREETING_3: `First of all, you should share with us some information about yourself, your needs and your knowledge. It allows other people to know what topics it will be interesting to discuss with you before the call. Are you ready?`,
    // GREETING_4: `Let me ask you some questions and we will create your profile that will be available to other participants. 🤓`,
    // GREETING_5: `Here we go?`,

    // onboarding.js
    askTellUsCommunity: 'Tell us which community you are interested in.',
    // askUsernameStr: 'What is your name?',

    ONBOARDING_1: `The first question is: Where are you from? (Country)`,

    ONBOARDING_2_1: `Next step:
What are you doing? 👨‍💻👩‍💻`,
    ONBOARDING_2_2: `Tell us about your work, company, project or startup you are involved in.`,
    ONBOARDING_2_3: `For example:

I'm a web designer in the Spanish game design studio or I am a marketer in the fintech project.`,

    ONBOARDING_3: `Ok. What about English speaking? Choose your level of English, it will help us to choose the right person for the call.`,

//     askFacebookUrlStr: `Fine. Could you share with me a link to your Facebook profile?

// It is necessary for the connection with your partners. We will send your partner the link in order to schedule the call.

// Where can you find the link?

// For Facebook Messenger: go to your profile, this is where the chat list is, copy the profile link and send it to the dialogue.

// If you use a web browser:
// 1) open Facebook.com in a new page and go to your profile page
// 2) copy the link from the address bar and send it to the dialogue.`,

    ONBOARDING_4_1: `Well done. 👍`,
    ONBOARDING_4_2: `Next question:
What is your passion? 👩‍🎨👨‍🎨
Could you tell something interesting about yourself, or could you share with us a link to your Twitter or LinkedIn? It will allow your partner to get to know you better.

(If you don’t know what to say, just text “none”)`,

    ONBOARDING_5: `OK. Now is the most important step. Choose the community:`,

//     askAboutExpertIn: `How could you be helpful? What area are you an expert in?

// For example, I'm a corporative lawyer with eighteenth years of experience. Feel free to ask me about registering the company, international law, and other paperwork.`,

    ONBOARDING_6_1: `And the last question, it is not necessary.`,
    ONBOARDING_6_2: `Who can you introduce? Who can you introduce to? 🤝`,
    ONBOARDING_6_3: `Write a few areas in which you have contacts and which might be useful to our community.`,
    ONBOARDING_6_4: `For example:

I know guys from Bank of America and TransferWise. I can help with the introduction to fintech companies.

(If you don’t know what to say, just text “none”)`,

    ONBOARDING_7: `😎 Great. Look at the result:

{{{vars.username}}}
{{{vars.facebook_url}}}
Location: {{{vars.location}}}
English Level: {{{vars.english_level}}}
Community: {{{vars.community}}}
Work: {{{vars.profession}}}
I have interested in: {{{vars.about_yourself}}}`,

    ONBOARDING_8: 'Thank you! Unfortunately the service in a testing mode. We are planning to go public in a month. But don’t be upset! We will give you 1 month fo free since the service will be started. Also we will notify you when it will happen.',
    GIF_GREETING: 'https://media.giphy.com/media/kaHP7Ci7xVFzN8JJbk/giphy.gif',
    GIF_ONBOARDING: 'https://media.giphy.com/media/STZxU3AXEdwW4caLwS/giphy.gif',
    // GIF_GREETING: `${__dirname}/assets/start.gif`,
    // GIF_ONBOARDING: `${__dirname}/assets/finish.gif`,

    INVITATION_MESSAGE: `We sent an invitation message to user!
We will notify you of his decision.

Thank you for being with us! 😊`,

    MATCH_NOT_FOUND_SUITABLE_USER: 'Sorry, but at the moment we have not found a suitable user for you.\n\nPlease try again later.',
    USER_DIALOG_SESSION_EXPIRED: 'Your session has expired.',

});
