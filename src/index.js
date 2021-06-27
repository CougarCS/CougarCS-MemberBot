require('dotenv').config();
const Discord = require('discord.js');
const mongoose = require("mongoose");
const Cache = require("./cache");
const fetch = require("node-fetch");
const fs = require('fs');
const { prefix, cougarcsServerIds } = require('./config.json');
const { getStatus, getEmail, getToken } = require('./memberAPI');
const { 
	INPUT_ERROR, 
	PUNT_TO_SERVER, 
	IS_A_MEMBER, 
	SOME_ERROR, 
	IF_THIS_IS_AN_ERROR, 
	USE_CLAIM_IF_NOT_MEMBER,
	PIMP_COUGARCS,
	BAD_BOT_CREDS,
	NO_MEMBER_RECORD,
	USE_SAME_EMAIL,
	isNotMemberMessage,
} = require("./copy");

const handledStatusCodes = [200, 404, 403];
const spacesRegex = / +/;
const psidRegex = /^\d{7}$/; 
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const userInputRegex = /^\d{7} +[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	await getToken();
});

client.on('message', async (message) => {
	if (message.author.bot) return;
	
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(spacesRegex);
		const command = args.shift().toLowerCase();
		if (!client.commands.has(command)) return;
	
		try {
			client.commands.get(command).execute(message);
			return;
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}


	if (message.channel.type == 'dm') {

		// Check if user already submitted valid psid, 
		if (await Cache.exists({discordId: {$eq:message.author.id}})) {
			// console.log(await Cache.exists({discordId: {$eq:message.author.id}}));
			await message.reply(PUNT_TO_SERVER);
			return;
		}

		// Check user's psid against API.
		const userInput = message.content.trim();

		if (!userInputRegex.test(userInput)) {
			await message.reply(INPUT_ERROR);
			return;
		}

		// Process Input
		const [psid, givenEmail] = userInput.split(spacesRegex).filter(str => str.length > 0);
		if (typeof psid !== "string" ||
			typeof givenEmail !== "string" ||
			!psidRegex.test(psid) || 
			!emailRegex.test(givenEmail)) {
			await message.reply(INPUT_ERROR);
			return;
		}

		const statusRespObj = await getStatus(psid);
		console.log("statusRespObj.status = " + statusRespObj.status);

		// Bad credentials.
		if (statusRespObj.status === 403) {
			await message.reply(BAD_BOT_CREDS);
			return;
		}

		// All other errors.
		if (!handledStatusCodes.includes(statusRespObj.status)) {
			await message.reply(SOME_ERROR);
			return;
		}

		// No record exists.
		if (statusRespObj.status === 404) {
			await message.reply(PIMP_COUGARCS);
			await message.reply(NO_MEMBER_RECORD);
			await message.reply(IF_THIS_IS_AN_ERROR);
			return;
		}

		// Record exists.
		if (statusRespObj.status === 200) {
			const json = await statusRespObj.json();

			// Not member.
			if (json['member-status'] === false) {
				await message.reply(PIMP_COUGARCS);
				await message.reply(isNotMemberMessage(json['Name']));
				if (json["Membership End"] !== undefined) 
					await message.reply(membershipExpiredOn(json['Membership End']));
				await message.reply(IF_THIS_IS_AN_ERROR);
				return;
			}
			
			// User is a member.

			// Check to see if they submitted the correct email.
			const actualEmail = await getEmail(psid);
			if (actualEmail === undefined) {
				await message.reply(SOME_ERROR);
				return;
			}

			console.log("actualEmail: " + actualEmail);
			if (givenEmail.toLowerCase() !== actualEmail.toLowerCase()) {
				await message.reply(USE_SAME_EMAIL);
				return;
			}

			let cacheSuccess = true;
			Cache.create({ discordId: message.author.id, psid: psid }, async (err) => {
				if (err) {
					await message.reply(SOME_ERROR);
					cacheSuccess = false;
					return;
				}
			});

			for (let serverId of cougarcsServerIds) {
				const guild = client.guilds.cache.find(g => g.id === serverId);
				if (guild === undefined) continue;

				// Add user to CougarCS server if user isn't already.
				if (!guild.members.cache.has(message.author.id)) {
					guild.members.add(message.author.id);
				}

				// Fetch member for server.
				const member = guild.members.cache.find(m => m.id === message.author.id);
				if (member === undefined) continue;
				
				// Fetch memberRole for server.
				const memberRole = guild.roles.cache.find(r => r.name.toLowerCase() === "member");
				if (memberRole === undefined) continue;

				// Add member role if user doesn't have it already.
				if ((await member.roles.cache.has(memberRole.id))) continue;
				await member.addRole(memberRole.id);
			}

			await message.reply(IS_A_MEMBER);
			if (cacheSuccess) await message.reply(USE_CLAIM_IF_NOT_MEMBER);
			await message.reply(IF_THIS_IS_AN_ERROR);
			return;
		}
	}	
});

client.login(process.env.TOKEN);