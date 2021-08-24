require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const { prefix, cougarcsServerIds, omitChannels, cougarcsInviteLinks, env } = require('./config.json');
const { getStatus, getEmail, getToken } = require('./memberAPI');
const { spacesRegex, userInputRegex, psidRegex, emailRegex } = require('./regex');
const { handledStatusCodes } = require('./util');
const { truncate } = require('lodash/truncate');
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
	NOT_A_MEMBER,
	GENERIC_GREETING,
	INPUT_EXAMPLE,
	INPUT_TEMPLATE,
	USE_OWN_DATA,
	PSID_IS_TAKEN,
} = require('./copy');
const { cacheExists, createCache, cacheExistsByPsid } = require('./mongodb');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	await getToken();
	console.log('Ready!');
});

client.on('message', async (message) => {
	try {
		if (message.author.bot || omitChannels.includes(message.channel.id) || message.type != 'DEFAULT') return;

		if (message.content.startsWith(prefix)) {
			const args = message.content.slice(prefix.length).trim().split(spacesRegex);
			const command = args.shift().toLowerCase();
			if (!client.commands.has(command)) return;

			try {
				client.commands.get(command).execute(message, client, args);
				return;
			}
			catch (error) {
				console.error(error);
				message.reply('there was an error trying to execute that command!');
			}
		}


		if (message.channel.type == 'dm') {

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

			console.log('statusRespObj.status = ' + statusRespObj.status);

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
				console.log('Status Response JSON: ' + JSON.stringify(json, null, 4));

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

				if (givenEmail.toLowerCase() !== actualEmail.toLowerCase()) {
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
					console.error(e);
					await message.reply(SOME_ERROR);
					return;
				}

				for (const serverId of cougarcsServerIds) {
					try {
						const guild = client.guilds.cache.find(g => g.id === serverId);
						if (guild === undefined) continue;

						// Invite user to CougarCS server if user isn't already a member.
						if (!guild.members.cache.has(message.author.id)) {
							await message.reply(inviteToServer(cougarcsInviteLinks[serverId]));
							continue;
						}

						// Fetch member for server.
						const member = guild.members.cache.find(m => m.id === message.author.id);
						console.log(`Member: ${JSON.stringify(member, null, 4)}`);
						if (member === undefined) continue;

						// Fetch memberRole for server.
						const guildMemberRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'member');
						console.log(`guildMemberRole: ${JSON.stringify(guildMemberRole, null, 4)}`);
						if (guildMemberRole === undefined) continue;

						// Add member role if user doesn't have it already.
						if (member.roles.cache.has(guildMemberRole.id)) continue;
						await member.roles.add(guildMemberRole);
					}
					catch(e) {
						console.error(e);
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
		if (env == 'prod') {
			await message.reply(SOME_ERROR);
			console.error(e);
			return;
		}
		else {
			await message.reply(`\`\`\`${truncate(e, { length: 1500 })}\`\`\``);
			return;
		}
	}
});

client.login(process.env.TOKEN);