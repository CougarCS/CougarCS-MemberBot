const { fetchRoles } = require('../util');
const {
	ALREADY_HAS_ROLE,
	ALREADY_CLAIMED,
	PUNT_TO_DM,
	MEMBER_ROLE_DOES_NOT_EXIST,
	OFFICER_ROLE_DOES_NOT_EXIST,
	PSID_PROMPT_QUALIFIER,
	PSID_PROMPT,
	INPUT_EXAMPLE,
	COULD_NOT_SEND_DM,
	informOfficer } = require('../copy');
const { cacheExists } = require('../mongodb');

module.exports = {
	name: 'claim',
	description: 'use to claim your Membership role.',
	useAllowedChannels: true,
	async execute(message, client, args) {
		// Check if member role exists. If not, shout out to an officer.
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

		// Check if user already has role, if so, exit.
		if (message.member.roles.cache.has(memberRole.id)) {
			await message.reply(ALREADY_HAS_ROLE);
			return;
		}

		// Check if user already in cache, if so, grant role and exit.
		if (await cacheExists(message.author.id)) {
			await message.member.roles.add(memberRole);
			await message.reply(ALREADY_CLAIMED);
			return;
		}

		// Otherwise, send DM for PSID and exit.
		try {
			await message.author.send(PSID_PROMPT_QUALIFIER);
			await message.author.send(PSID_PROMPT);
			await message.author.send(INPUT_EXAMPLE);
			await message.reply(PUNT_TO_DM);
		}
		catch (e) {
			console.error(e);
			await message.reply(COULD_NOT_SEND_DM);
		}
	},
};