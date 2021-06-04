const { ALREADY_HAS_ROLE, ALREADY_CLAIMED, PUNT_TO_DM } = require('../copy');
const Cache = require('../cache');
const mongoose = require('mongoose');

module.exports = {
	name: 'claim',
	description: 'use to claim your Membership role.',
	async execute(message, args, role) {
		// Check if user already has role, if so, exit.
		if (message.member.roles.cache.has(role.id)) {
			await message.reply(ALREADY_HAS_ROLE);
			return;
		}
		
		// Check if user already in cache, if so, grant role and exit.
		if (await Cache.exists({ discordId: { '$eq': message.author.id } })) {
			await message.member.roles.add(role);
			await message.reply(ALREADY_CLAIMED);
			return;
		}

		// Otherwise, send DM for PSID and exit.
		await message.reply(PUNT_TO_DM);
	},
};