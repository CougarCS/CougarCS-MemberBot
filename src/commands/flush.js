const { fetchRoles } = require("../util");
const { MEMBER_ROLE_DOES_NOT_EXIST, OFFICER_ROLE_DOES_NOT_EXIST, NOT_ENOUGH_PYLONS } = require("../copy")

module.exports = {
	name: 'flush',
	superuser: true,
	description: 'remove expired roles.',
	async execute(message) {
		// Check if roles exist.
		const [memberRole, officerRole] = fetchRoles(message);
		if (memberRole === undefined) {
			await message.reply(MEMBER_ROLE_DOES_NOT_EXIST);
			if (officerRole) await message.channel.send(informOfficer(officerRole));
			return;
		}

		if (officerRole === undefined) {
			await message.reply(OFFICER_ROLE_DOES_NOT_EXIST);
			return;
		}

		// Check if user has required roles.
		if (!message.author.roles.cache.has(memberRole.id) || !message.author.roles.cache.has(officerRole.id)) {
			await message.reply(NOT_ENOUGH_PYLONS);
			return;
		}

	},
};