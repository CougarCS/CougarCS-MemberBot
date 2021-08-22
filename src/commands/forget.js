const { fetchRoles, getUserFromMention } = require('../util');
const { cougarcsServerIds } = require('../config.json');
const {
	MEMBER_ROLE_DOES_NOT_EXIST,
	OFFICER_ROLE_DOES_NOT_EXIST,
	NOT_ENOUGH_PYLONS,
	NOT_IN_CACHE,
	GENERIC_MEMBER_ROLE_REMOVED,
	YOU_HAVE_BEEN_FORGOTTEN,
	informOfficer,
	userHasBeenForgotten,
	userNotInCache,
	SOME_ERROR,
	memberRoleHasBeenRemovedFromUser } = require('../copy');

const { cacheExists, deleteCacheByDiscordId } = require('../mongodb');
const { mentionRegex } = require('../regex');

async function forgetAuthor(message) {
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
		console.error(e);
		return;
	}

	await message.reply(YOU_HAVE_BEEN_FORGOTTEN);
}

module.exports = {
	name: 'forget',
	description: 'use if you would like me to erase you from my memory. (args for officers only)',
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
			console.error(e);
			return;
		}

		await message.reply(YOU_HAVE_BEEN_FORGOTTEN);
		return;
	},
};