const { fetchRoles, getUserFromMention } = require('../util');
const { cougarcsServerIds } = require('../config.json');
const {
	MEMBER_ROLE_DOES_NOT_EXIST,
	OFFICER_ROLE_DOES_NOT_EXIST,
	NOT_ENOUGH_PYLONS,
	informOfficer,
	userHasBeenForgotten,
	userNotInCache,
	SOME_ERROR,
	memberRoleHasBeenRemovedFromUser } = require('../copy');

const { cacheExists, deleteCacheByDiscordId } = require('../mongodb');
const { mentionRegex } = require('../regex');

module.exports = {
	name: 'revert',
	description: '(officers only) completely revert onboarding flow for users.',
	usage: '<...@username>',
	example: ['@username1', '@username1 @username2'],
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