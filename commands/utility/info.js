const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Узнай информацию про пользователя'),
	async execute(interaction) {
		await interaction.reply('Pong 2.0!');
	},
};