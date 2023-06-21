const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gather')
		.setDescription('Собирай друзей в любимые игры!'),
	async execute(interaction) {
		await interaction.reply('Pong 2.0!');
	},
};