const { SlashCommandBuilder } = require('discord.js');
const { firestore } = require('../../firebase-admin');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Узнай информацию про пользователя')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Имя пользователя')
				.setRequired(true)),
	async execute(interaction) {
		const userQuery = firestore.collection('users').where('name', '==', interaction.user.username).limit(1);
		let userData
		userQuery.get()
			.then(async snapshot => {
				if (!snapshot.empty) {
					const userDoc = snapshot.docs[0];
					const userData = userDoc.data();
					console.log('User Data:', userData);
					await interaction.reply('ID is - ' + userData.id);
				} else {
					await interaction.reply('User document not found');
				}
			})
			.catch(error => {
				console.error('Error fetching user document:', error);
				interaction.reply('Error fetching user document');
			});
	},
};