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

async function forgetAuthor(message, memberRole) {
	// Remove member role.
	if (message.member.roles.cache.has(memberRole.id)) {
		await message.member.roles.remove(memberRole);
		await message.reply(GENERIC_MEMBER_ROLE_REMOVED);
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
}

module.exports = {
	name: 'forget',
	description: 'use if you would like me to forget you.',
	async execute(message, client, args) {

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

		if (!args.length) {
			await forgetAuthor(message, memberRole);
			return;
		}

		// Check if user has required roles.
		if (!message.member.roles.cache.has(memberRole.id) || !message.member.roles.cache.has(officerRole.id)) {
			await message.reply(NOT_ENOUGH_PYLONS);
			return;
		}

		for (const arg of args) {
			if (!mentionRegex.test(arg)) continue;

			const user = getUserFromMention(client, arg);

			for (const serverId of cougarcsServerIds) {
				const guild = client.guilds.cache.find(g => g.id === serverId);
				if (guild === undefined) continue;

				const guildMemberRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'member');
				if (guildMemberRole === undefined) continue;

				const member = guild.members.cache.find(m => m.id === user.id);
				if (member === undefined) continue;

				if (member.roles.cache.has(guildMemberRole.id)) {
					member.roles.remove(guildMemberRole);
					await message.reply(memberRoleHasBeenRemovedFromUser(user.id));
				}
			}

			// Check if user exists in cache.
			if (!(await cacheExists(user.id))) {
				await message.reply(userNotInCache(user.id));
				continue;
			}

			try {
				await deleteCacheByDiscordId(user.id);
				await message.reply(userHasBeenForgotten(user.id));
			}
			catch (e) {
				await message.reply(SOME_ERROR);
				console.error(e);
				return;
			}
		}
	},
};