require('dotenv').config();
const Discord = require('discord.js');

const fs = require('fs');
const { cougarcsServerIds, omitChannels, allowChannels, cougarcsInviteLinks, env, cooldown } = require('./config.json');
const { getStatus, getEmail, getToken } = require('./memberAPI');
const { spacesRegex, userInputRegex, psidRegex, emailRegex } = require('./regex');
const { handledStatusCodes, detectPrefix, solutionism } = require('./util');
const _ = require('lodash');
const {
	INPUT_ERROR,
	PUNT_TO_SERVER,
	IS_A_MEMBER,
	SOME_ERROR,
	IF_THIS_IS_AN_ERROR,
	USE_CLAIM_IF_NOT_MEMBER,
	NO_MEMBER_RECORD,
	USE_SAME_EMAIL,
	expiredMember,
	specificGreeting,
	inviteToServer,
	cooldownLeftMessage,
	NOT_A_MEMBER,
	GENERIC_GREETING,
	INPUT_EXAMPLE,
	INPUT_TEMPLATE,
	USE_OWN_DATA,
	PSID_IS_TAKEN,
} = require('./copy');
const { cacheExists, createCache, cacheExistsByPsid } = require('./mongodb');
const createLogger = require('./logger');

const logger = createLogger(__filename);
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const dmCooldown = new Map();
client.once('ready', async () => {
	await getToken();
	logger.info('Ready!');
});

client.on('message', async (message) => {
	try {
		if (message.author.bot || omitChannels.includes(message.channel.id) || message.type != 'DEFAULT') return;

		const prefix = detectPrefix(message);
		if (prefix) {
			const args = message.content.slice(prefix.length).trim().split(spacesRegex);
			const commandName = args.shift().toLowerCase();
			if (!client.commands.has(commandName)) return;

			try {
				const command = client.commands.get(commandName);
				if (command.useAllowedChannels && !allowChannels.includes(message.channel.id)) return;
				command.execute(message, client, args);
				return;
			}
			catch (error) {
				logger.error(error);
				message.reply('there was an error trying to execute that command!');
			}
		}


		if (message.channel.type == 'dm') {
			// Check if dm is cooling down before proceeding.
			if (dmCooldown.has(message.author.id)) {

				// Remove cooldown if expired.
				if (dmCooldown.get(message.author.id) < Date.now()) {dmCooldown.delete(message.author.id);}

				// Inform if cooldown is active.
				else {
					const cooldownLeft = dmCooldown.get(message.author.id) - Date.now();
					dmCooldown.set(message.author.id, Date.now() + cooldownLeft);
					await message.reply(cooldownLeftMessage(cooldownLeft));
					return;
				}

			}

			// If not in cooldown, add cooldown.
			dmCooldown.set(message.author.id, Date.now() + cooldown);
			setTimeout(() => dmCooldown.delete(message.author.id), cooldown + 100);

			// Check if user already submitted valid psid,
			if (await cacheExists(message.author.id)) {
				await message.reply(PUNT_TO_SERVER);
				return;
			}

			// Check user's psid against API.
			const userInput = message.content.trim();

			if (!userInputRegex.test(userInput)) {
				await message.reply(INPUT_ERROR);
				await message.reply(INPUT_EXAMPLE);
				return;
			}

			if (userInput == INPUT_TEMPLATE) {
				await message.reply(USE_OWN_DATA);
				return;
			}

			// Process Input
			const [psid, givenEmail] = userInput.split(spacesRegex).filter(str => str.length > 0);
			if (typeof psid !== 'string' ||
			typeof givenEmail !== 'string' ||
			!psidRegex.test(psid) ||
			!emailRegex.test(givenEmail)) {
				await message.reply(INPUT_ERROR);
				return;
			}

			const statusRespObj = await getStatus(psid);
			if (statusRespObj === undefined) {
				await message.reply(SOME_ERROR);
				return;
			}

			logger.info('statusRespObj.status = ' + statusRespObj.status);

			// All other errors.
			if (!handledStatusCodes.includes(statusRespObj.status)) {
				await message.reply(SOME_ERROR);
				return;
			}

			// No record exists.
			if (statusRespObj.status === 404) {
				await message.reply(GENERIC_GREETING);
				await message.reply(NO_MEMBER_RECORD);
				await message.reply(IF_THIS_IS_AN_ERROR);
				return;
			}

			// Record exists.
			if (statusRespObj.status === 200) {
				const json = await statusRespObj.json();
				logger.info('Status Response JSON: ' + JSON.stringify(json, null, 4));

				// Not member.
				if (json['Membership Status'] === false) {
					await message.reply(specificGreeting(json['First Name']));
					if (json['Membership Start'] === null) {
						await message.reply(NOT_A_MEMBER);
					}
					else {
						await message.reply(expiredMember(json['Membership End']));
					}
					await message.reply(IF_THIS_IS_AN_ERROR);
					return;
				}

				// Check to see if they submitted the correct email.
				const actualEmail = await getEmail(psid);
				if (actualEmail === undefined) {
					await message.reply(SOME_ERROR);
					return;
				}

				if (solutionism(givenEmail.toLowerCase()) !== solutionism(actualEmail.toLowerCase())) {
					await message.reply(USE_SAME_EMAIL);
					return;
				}

				// Check for any collisions!

				try {
					if (await cacheExistsByPsid(psid)) {
						await message.reply(PSID_IS_TAKEN);
						await message.reply(IF_THIS_IS_AN_ERROR);
						return;
					}
				}
				catch (e) {
					await message.reply(SOME_ERROR);
					return;
				}

				// ---- USER IS A MEMBER ----

				// Create cached map of discord ID to PSID.
				try {
					await createCache(message.author, psid);
				}
				catch (e) {
					logger.error(e);
					await message.reply(SOME_ERROR);
					return;
				}

				for (const serverId of cougarcsServerIds) {
					try {
						const guild = await client.guilds.fetch(serverId);
						if (guild === undefined) continue;

						// Invite user to CougarCS server if user isn't already a member.
						if (!guild.members.cache.has(message.author.id)) {
							await message.reply(inviteToServer(cougarcsInviteLinks[serverId]));
							continue;
						}

						// Fetch member for server.
						const member = await guild.members.fetch(message.author);
						logger.info(`Member: ${JSON.stringify(member, null, 4)}`);
						if (member === undefined) continue;

						// Fetch memberRole for server.
						const guildMemberRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'member');
						logger.info(`guildMemberRole: ${JSON.stringify(guildMemberRole, null, 4)}`);
						if (guildMemberRole === undefined) continue;

						// Add member role if user doesn't have it already.
						if (member.roles.cache.has(guildMemberRole.id)) continue;
						await member.roles.add(guildMemberRole);
					}
					catch(e) {
						logger.info(e);
						continue;
					}
				}

				await message.reply(IS_A_MEMBER);
				await message.reply(USE_CLAIM_IF_NOT_MEMBER);
				return;
			}
		}
	}
	catch (e) {
		logger.error(e);
		if (env == 'prod') {
			await message.reply(SOME_ERROR);
			return;
		}
		else {
			await message.reply(`\`\`\`${_.truncate(e.stack, { length: 1500 })}\`\`\``);
			return;
		}
	}
});

client.login(process.env.TOKEN);