require('dotenv').config();
const Discord = require('discord.js');
const mongoose = require("mongoose");
const fs = require('fs');
const { prefix, serverRoleMap } = require('./config.json');

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
	const roleId = serverRoleMap[message.guild.id];
	const role = await message.guild.roles.fetch(roleId);

	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args, role);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}

	if (message.channel.type == 'dm') {
		// TODO: Spam protect this code.
		// Check user's psid against Api.
		// If record exists and member --> grant role, add to cache, post discordId, & inform expiry.
		// If record exists and not member --> post discordId, inform expiry, pimp ccs.
		// If no record exists --> pimp ccs.
	}
});

client.login(process.env.TOKEN);