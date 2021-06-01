require('dotenv').config();
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const { pretty } = require('./util');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async (message) => {
	const role = message.guild.roles;
	if (message.content.toLowerCase() == 'ping.') {await message.reply(pretty("test", role));}
});

client.login(process.env.TOKEN);