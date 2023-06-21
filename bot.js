const fetchGameIcon = require('./fetch.js');
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});
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

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply('Pong!')
  }
});
// Event: Message received
client.on('messageCreate', async (message) => {
  // Check if the message starts with your bot's command prefix
  console.log(`Received message: ${message.content}`);
  const prefix = '!'; // Change this to your desired command prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Split the message content into command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  console.log('command is ' + command)

  // Handle different commands
  if (command === 'createpoll') {
    // Handle the create poll command logic here
    // Extract poll question and options from args array
    // Create a poll, store data, and send a response
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

    const thumbnailUrl = await fetchGameIcon(gameName);

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Some title')
      .setThumbnail(thumbnailUrl)
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
      )
      .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()

    message.channel.send({ embeds: [exampleEmbed] });
  }

});
const token = process.env.BOT_TOKEN;
client.login(token);
