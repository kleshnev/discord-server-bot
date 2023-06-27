const fetchGameIcon = require('./fetch.js');
const admin = require('firebase-admin');
const { db } = require('./firebase-admin');

// Access the Firestore database instance
const firestore = admin.firestore();
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, EmbedBuilder, Collection, Events} = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Database test integration


// Event: Bot is ready
client.on('ready', () => {
  const tokenAPI = process.env.ICON_API;
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`API TOK IS ${tokenAPI}`);
  client.channels.fetch('874296978266288170')
    .then((channel) => {
      if (channel && channel.type === 'text') {
        channel.send('Hello from the bot!');
      }
    })
    .catch(console.error);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
  const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Event: Message received
client.on('messageCreate', async (message) => {
  // Check if the message starts with your bot's command prefix
  console.log(`Received message: ${message.content}`);
  const prefix = '!'; // Change this to your desired command prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
  let member = message.member;
  let nickname = member.displayName;
  // Split the message content into command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  console.log('command is ' + command)

  // Handle different commands
  if (command === 'testdb') {
    firestore.collection('users').add({
      id: member.id,
      name: member.nickname,
    })
      .then((docRef) => {
        console.log('Document written with ID:', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document:', error);
      });
  }

  if (command === 'gather') {
    // Check if the user provided the necessary arguments
    if (args.length !== 2) {
      message.channel.send('Введите название игры и количество игроков !gather <Название> <Кол-во игроков>');
      return;
    }

    const gameName = args[0];
    const playersCount = parseInt(args[1]);

    // Validate the playersCount argument
    if (isNaN(playersCount) || playersCount <= 0) {
      message.channel.send('Введите правильное значение количества игроков');
      return;
    }

    //const image = await fetchGameIcon(gameName);
    const image = `https://i.imgur.com/d6KibHs.jpg`; 
    const partyEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`Собираем пати в игру ${gameName}!`)
      .addFields(
        { name: 'Требуется игроков:', value: `${playersCount}` },
        { name: '\u200B', value: '\u200B' },
        { name: 'Создано пользователем', value: `${nickname}`, inline: true }
      )
      .addFields(
        {name: ``,value}
      )
      .setImage(image)
      .setTimestamp()

    message.channel.send({ embeds: [partyEmbed] });
  }

});
//token hidden in .env file due to privacy reasons
const token = process.env.BOT_TOKEN;
client.login(token);
