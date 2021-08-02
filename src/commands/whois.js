const { fetchRoles } = require('../util');
const {
	WHO_IS_HELP,
	OFFICER_ONLY_CHANNELS,
	MEMBER_ROLE_DOES_NOT_EXIST,
	OFFICER_ROLE_DOES_NOT_EXIST,
	NOT_ENOUGH_PYLONS, SOME_ERROR,
	apiResponse,
	cacheResponse,
	LOOKS_FUNKY,
	NOT_IN_CACHE } = require('../copy');
const { psidRegex, emailRegex } = require('../regex');
const { getContactInfoByPsid, getContactInfoByEmail } = require('../memberAPI');
const { officerChannels } = require('../config.json');
const { getOneCacheByPsid } = require('../mongodb');

module.exports = {
	name: 'whois',
	superuser: true,
	description: '(officers only) lookup person by PSID.',
	async execute(message, client, args) {

		// Check if command was sent in an approved channel.
		if (!officerChannels.includes(message.channel.id)) {
			await message.reply(OFFICER_ONLY_CHANNELS);
			return;
		}

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

		if (psidRegex.test(args[0])) {
			const resp = await getContactInfoByPsid(args[0]);
			if (resp == undefined) {
				await message.reply(SOME_ERROR);
				return;
			}
			await message.reply(apiResponse(resp));
			try {
				cacheResp = await getOneCacheByPsid(args[0]);
				await message.reply(cacheResponse(cacheResp));
			}
			catch (e) {
				await message.reply(NOT_IN_CACHE);
				console.error(e);
			}
			await message.reply(LOOKS_FUNKY);
			return;
		}

		if (emailRegex.test(args[0])) {
			const resp = await getContactInfoByEmail(args[0]);
			if (resp == undefined) {
				await message.reply(SOME_ERROR);
				return;
			}
			await message.reply(apiResponse(resp));
			return;
		}

		await message.reply(WHO_IS_HELP);
		return;

	},
};