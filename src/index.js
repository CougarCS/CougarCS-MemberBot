require('dotenv').config();
const Discord = require('discord.js');
const mongoose = require("mongoose");
const Cache = require("./cache");
const fetch = require("node-fetch");
const fs = require('fs');
const { prefix, cougarcsServerIds } = require('./config.json');
const { 
	INPUT_ERROR, 
	PUNT_TO_SERVER, 
	IS_A_MEMBER, 
	SOME_ERROR, 
	IF_THIS_IS_AN_ERROR, 
	USE_CLAIM_IF_NOT_MEMBER, 
	isNotMemberMessage,
} = require("./copy");

const handledStatusCodes = [200, 404, 403];
const baseUrl = process.env.MEMBER_API;
const psidRegex = /^\d{8}$/;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}


client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async (message) => {
	if (message.author.bot) return;
	
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();
		if (!client.commands.has(command)) return;
	
		try {
			client.commands.get(command).execute(message, args, role);
			return;
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}


	if (message.channel.type == 'dm') {
		// Check if user already submitted valid psid, 
		if (Cache.exists({discordId: {$eq:message.author.id}})) {

			// If so, send him off...
			if (Cache.exists({discordId: {$eq:message.author.id}})) {
				await message.reply(PUNT_TO_SERVER);
				return;
			}
		}

		// Check user's psid against API.
		const psid = message.content.trim();
		if (!psidRegex.test(psid)) {
			await message.reply(INPUT_ERROR);
			return;
		}

		const url = baseUrl + "contact/status?psid=" + psid;
		const responseObj = await fetch(url, { method: 'GET'});

		if (!handledStatusCodes.includes(responseObj.status)) {
			await message.reply(SOME_ERROR);
			return;
		}

		// Bad credentials.
		if (responseObj.status === 403) {
			await message.reply(BAD_BOT_CREDS);
			return;
		}

		// No record exists.
		if (responseObj.status === 404) {
			await message.reply(PIMP_COUGARCS);
			await message.reply(NO_MEMBER_RECORD);
			await message.reply(IF_THIS_IS_AN_ERROR);
			return;
		}

		// Record exists.
		if (responseObj.status === 200) {
			const json = responsObj.json();

			// Not member.
			if (json['member-status'] === false) {
				await message.reply(isNotMemberMessage(json['Name']));
				if (json["Membership End"] !== undefined) 
					await message.reply(membershipExpiredOn(json['Membership End']));
				await message.reply(PIMP_COUGARCS);
				await message.reply(IF_THIS_IS_AN_ERROR);
				return;
			}
			
			// User is a member.
			let cacheSuccess = false;
			Cache.create({ discordId: message.author.id, psid: psid }, (err) => {
				if (err) {
					await message.reply(SOME_ERROR);
					cacheSuccess = true;
					return;
				}
			});

			for (let serverId of cougarcsServerIds) {
				const guild = await client.guilds.cache.fetch(serverId);
				if (guild === undefined) continue;

				// Add user to CougarCS server if he isn't already.
				if (!(await guild.member.cache.has(message.author.id))) {
					await guild.member.add(message.author.id);
				}

				// Fetch member for server.
				const member = await guild.member.cache.find(m => m.id === message.author.id);
				if (member === undefined) continue;
				
				// Fetch memberRole for server.
				const memberRole = await guild.roles.cache.find(r => r.name.toLowerCase() === "member");
				if (memberRole === undefined) continue;

				// Add member role if he doesn't have it already.
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