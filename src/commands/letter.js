const { fetchRoles } = require("../util");
const Cache = require('../cache');
const mongoose = require('mongoose');
const { DiscordAPIError } = require('discord.js');
const { 
	ALREADY_HAS_ROLE, 
	ALREADY_CLAIMED, 
	PUNT_TO_DM, 
	MEMBER_ROLE_DOES_NOT_EXIST, 
	PSID_PROMPT_QUALIFIER, 
	PSID_PROMPT,
	INPUT_EXAMPLE,
	informOfficer, 
    LETTER_FROM_ME_01,
    LETTER_FROM_ME_02} = require('../copy');  
const { cacheExists } = require("../mongodb");

module.exports = {
	name: 'letter',
	description: 'my creator left a letter for you to read.',
	async execute(message) {
		await message.author.send(LETTER_FROM_ME_01);
		await message.author.send(LETTER_FROM_ME_02);
	},
};