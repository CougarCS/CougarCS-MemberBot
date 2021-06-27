const config = require("./config.json");

module.exports = {
    MEMBER_ROLE_DOES_NOT_EXIST: "A role named \`Member\` does not exist!",
    OFFICER_ROLE_DOES_NOT_EXIST: "A role named \`Officer\` does not exist!",
	ALREADY_HAS_ROLE: 'You already have the \`Member\` role.',
    ALREADY_CLAIMED: "Nice to see you again. \`Member\` role granted.",
    NOT_ENOUGH_PYLONS: "You do not have the required credentials to use this command!",
    PUNT_TO_DM: "We'll need to chat in private. Check your DM to continue.",
    PSID_PROMPT_QUALIFIER: "To give you the \`Member\` role, I'll need to look you up in our member database.",
    PSID_PROMPT: "Would you mind replying with your Peoplesoft ID, followed by your email address? I'll need those to look you up.",
    INPUT_EXAMPLE: "For example, a valid response looks like this: \`12345678 somone@somewhere.com\`",
    INPUT_ERROR: "I didn't understand your response. Please enter your PeopleSoft ID followed by your email address. I'll need those to look you up.",
    NO_MEMBER_RECORD: "We don't see you in our Members database. Consider joining CougarCS here: <https://www.cougarcs.com/register/>",
    PIMP_COUGARCS: "CougarCS is one of the largest, student-lead Computer Science clubs at the University of Houston.",
    IS_A_MEMBER: "**Congradulations!** You have been granted the \`Member\` role on all of the CougarCS Discord Servers. It's a pleasure to have you!",
    PUNT_TO_SERVER: `I remember you! Go to any server and use the \`${config.prefix}claim\` command to redeem your membership role.`,
    USE_CLAIM_IF_NOT_MEMBER: `If you ever find yourself without the \`Member\` role on our servers, use the \`${config.prefix}claim\` command again, and I'll take care of it.`,
    IF_THIS_IS_AN_ERROR: "If you feel this was an error, consider informing a CougarCS Officer of the issue.",
    BAD_BOT_CREDS: "My credentials are no longer valid. Please inform a CougarCS Officer to get this issue resolved!",
    SOME_ERROR: "Oops! Something went wrong. Please try again later.",
    USE_SAME_EMAIL: "Please try again. Use the same email that you used to register for your CougarCS Membership.", 
    isNotMemberMessage: name => `Hey ${name}, we found you in our records, but we noticed you weren't a member. Consider joining CougarCS here: <https://www.cougarcs.com/register/>`,
    informOfficer: officerRole => `<@${officerRole.id}>, please add a role named \`Member\` to the server!`,
    expiredMember: expiry => `According to our records, your membership expired on ${expiry["Term"]} of ${expiry["Year"]}.`,
    ABOUT: `I was created in the Summer of 2021 by a gentlemen named Adil Iqbal. He has left a letter for you to read (privately). Use the \`${config.prefix}letter\` command to read it.`,
    LETTER_FROM_ME: 
    `\`\`\`
    Dear reader,

    During the Fall of 2020, I was a CS major at the University
    of Houston. At the time, I was looking for ways to distinguish
    myself from my cohort. I decided to take a chance and, for
    the price of a large pizza [1], I purchased a membership to
    CougarCS. I also volunteered as a tutor for their club. I
    figured it would look good on a resume.

    Later that semester, I attended an obscure info session held
    on the CougarCS discord server by a financial tech company [2].
    I would go on to receive an intership offer from that company
    valued at the price of an entire year's tuition at the University
    of Houston [1]. That's not a typo. The internship salary paid
    for an ENTIRE YEAR of tuition.

    This bot is one of the many ways [3] that I have decided to give
    back to CougarCS for all it has done for me. I likely would
    not have had the money to graduate if not for them. The friends
    I have made along the way mean a lot to me personally, and will
    continue to be part of my network professionally.
    
    Getting involved with this club is a great way to kickstart
    your career progression and have some fun along the way. The
    very first step is to invest in a membership [4]. It's worth 
    every penny. https://www.cougarcs.com/register/

    Yours truly,
    Adil Iqbal
    
    -- Footnotes --

    [1] At the time of this writing, the inflation rate has hit 5%,
        so I do not know if these numbers mean the same thing to you
        as they did to me. The cost of the membership was $12. The
        salary from the internship was $15,500 over 90 days.
    
    [2] The company I am talking about here is Bill.com. If you
        are a CS major, check them out! A lot of University of 
        Houston grads work here. https://www.bill.com
    
    [3] I was also the Director of Tutoring at CougarCS in the
        Spring of 2021. And I built another bot named 
        CougarCS-LogBot that helps track volunteer hours.
        I do not know what the future holds, but CougarCS is
        certainly in my thoughts.
    
    [4] I have never received a kick-back from CougarCS. This 
        letter is not an advertisement. 
        It is advice from a friend.
    \`\`\``,
};