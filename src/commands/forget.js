const { fetchRoles } = require("../util");
const { 
	MEMBER_ROLE_DOES_NOT_EXIST,
    OFFICER_ROLE_DOES_NOT_EXIST,
	NOT_IN_CACHE,
    YOU_HAVE_BEEN_FORGOTTEN,
	informOfficer, 
    SOME_ERROR} = require('../copy');  
const { cacheExists, deleteCacheByDiscordId } = require("../mongodb");

module.exports = {
	name: 'forget',
	description: 'use if you would like me to forget you.',
	async execute(message) {

        // Retrieve roles.
        const [memberRole, officerRole] = await fetchRoles(message);

        if (officerRole === undefined) {
			await message.reply(OFFICER_ROLE_DOES_NOT_EXIST);
			return;
		}

        if (memberRole === undefined) {
			await message.reply(MEMBER_ROLE_DOES_NOT_EXIST);
			if (officerRole) await message.channel.send(informOfficer(officerRole));
			return;
		}

        if (!(await cacheExists(message.author.id))) {
            await message.reply(NOT_IN_CACHE);
            return;
        }

		// Check if user already in cache, if so, grant role and exit.
        try {
            await deleteCacheByDiscordId(message.author.id);
        } catch (e) {
            await message.reply(SOME_ERROR);
            console.error(e);
            return;
        }


        if (message.member.roles.cache.has(memberRole.id)) {
            await message.member.roles.cache.remove(memberRole);
			return;
		}

        await message.reply(YOU_HAVE_BEEN_FORGOTTEN);
	},
};