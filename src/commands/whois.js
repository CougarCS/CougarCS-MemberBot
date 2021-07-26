const { fetchRoles } = require("../util");
const { MEMBER_ROLE_DOES_NOT_EXIST, OFFICER_ROLE_DOES_NOT_EXIST, NOT_ENOUGH_PYLONS, SOME_ERROR, apiResponse, notValidPsid } = require("../copy");
const { psidRegex } = require("../regex");
const { getContactInfo } = require("../memberAPI");

module.exports = {
	name: 'whois',
	superuser: true,
	description: '(officers only) lookup person by PSID.',
	async execute(message, client, args) {

		// Check if roles exist.
		const [memberRole, officerRole] = await fetchRoles(message);
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
		if (!message.member.roles.cache.has(memberRole.id) || !message.member.roles.cache.has(officerRole.id)) {
			await message.reply(NOT_ENOUGH_PYLONS);
			return;
		}

		if (!psidRegex.test(args[0])) {
			await message.reply(notValidPsid(args[0]));
			return;
		}

		const resp = await getContactInfo(args[0]);
		if (resp == undefined) {
			await message.reply(SOME_ERROR);
			return;
		}

		await message.author.send(apiResponse(resp));
	},
};