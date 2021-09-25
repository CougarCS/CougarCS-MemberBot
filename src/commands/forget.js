const { fetchRoles } = require('../util');
const {
	MEMBER_ROLE_DOES_NOT_EXIST,
	NOT_IN_CACHE,
	YOU_HAVE_BEEN_FORGOTTEN,
	informOfficer,
	SOME_ERROR } = require('../copy');
const { cacheExists, deleteCacheByDiscordId } = require('../mongodb');
const createLogger = require('../../logger');
const logger = createLogger(__filename);


module.exports = {
	name: 'forget',
	description: 'use if you would like me to erase you from my memory. (args for officers only)',
	useAllowedChannels: true,
	async execute(message, client, args) {

		// Retrieve roles.
		const [memberRole, officerRole] = await fetchRoles(message);

		if (memberRole === undefined) {
			await message.reply(MEMBER_ROLE_DOES_NOT_EXIST);
			if (officerRole) await message.channel.send(informOfficer(officerRole));
			return;
		}

		// Check if user exists in cache.
		if (!(await cacheExists(message.author.id))) {
			await message.reply(NOT_IN_CACHE);
			return;
		}

		// Remove user from cache.
		try {
			await deleteCacheByDiscordId(message.author.id);
		}
		catch (e) {
			await message.reply(SOME_ERROR);
			logger.error(e);
			return;
		}

		await message.reply(YOU_HAVE_BEEN_FORGOTTEN);
		return;
	},
};