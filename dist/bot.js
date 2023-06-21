"use strict";

require('dotenv').config();
var fetchGameIcon = require('./dist/fetch.js')["default"];
var _require = require('discord.js'),
  Client = _require.Client,
  GatewayIntentBits = _require.GatewayIntentBits,
  EmbedBuilder = _require.EmbedBuilder,
  MessageButton = _require.MessageButton,
  MessageActionRow = _require.MessageActionRow;
var client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
// Event: Bot is ready
client.on('ready', function () {
  console.log("Logged in as ".concat(client.user.tag));
  client.channels.fetch('874296978266288170').then(function (channel) {
    if (channel && channel.type === 'text') {
      channel.send('Hello from the bot!');
    }
  })["catch"](console.error);
});
client.on('messageCreate', function (message) {
  if (message.content === 'ping') {
    message.reply('Pong!');
  }
});
// Event: Message received
client.on('messageCreate', function (message) {
  // Check if the message starts with your bot's command prefix
  console.log("Received message: ".concat(message.content));
  var prefix = '!'; // Change this to your desired command prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Split the message content into command and arguments
  var args = message.content.slice(prefix.length).trim().split(/ +/);
  var command = args.shift().toLowerCase();
  console.log('command is ' + command);

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
    var gameName = args[0];
    var playersCount = parseInt(args[1]);

    // Validate the playersCount argument
    if (isNaN(playersCount) || playersCount <= 0) {
      message.channel.send('Введите правильное значение количества игроков');
      return;
    }
    try {
      fetchGameIcon(gameName).then(function (gameIcon) {
        var gatheringEmbed = new EmbedBuilder().setColor(0x0099FF).setTitle("\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C\u0441\u044F \u0432 \u0438\u0433\u0440\u0443 ".concat(gameName)).setAuthor({
          name: 'Some name',
          iconURL: 'https://i.imgur.com/AfFp7pu.png'
        }).setDescription('Some description here').setThumbnail(gameIcon).addFields({
          name: 'Regular field title',
          value: 'Some value here'
        }, {
          name: "\u200B",
          value: "\u200B"
        }, {
          name: 'Inline field title',
          value: 'Some value here',
          inline: true
        }, {
          name: 'Inline field title',
          value: 'Some value here',
          inline: true
        }).addFields({
          name: 'Inline field title',
          value: 'Some value here',
          inline: true
        }).setImage('https://i.imgur.com/AfFp7pu.png').setTimestamp().setFooter({
          text: 'Some footer text here',
          iconURL: 'https://i.imgur.com/AfFp7pu.png'
        });
        message.channel.send({
          embeds: [gatheringEmbed]
        });
      })["catch"](function (error) {
        message.author.send('Game icon not found.');
        message["delete"]()["catch"](console.error); // Delete the command message
        console.error(error);
      });
    } catch (error) {
      console.error('Failed to fetch game icon:', error);
    }
  }
});
var token = process.env.BOT_TOKEN;
client.login(token);