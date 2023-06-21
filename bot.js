require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
});
// Event: Bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get('874296978266288170');

  // Send a message in the channel
  if (channel && channel.type === 'text') {
    channel.send('Hello from the bot!');
  }
});

// Event: Message received
client.on('messageCreated', (message) => {
  // Check if the message starts with your bot's command prefix
  console.log(`Received message: ${message.content}`);
  const prefix = '!'; // Change this to your desired command prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Split the message content into command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  console.log('command is ' + command)
  message.channel.send('i see command '+ command)

  // Handle different commands
  if (command === 'createpoll') {
    // Handle the create poll command logic here
    // Extract poll question and options from args array
    // Create a poll, store data, and send a response
  }

  if(command === 'test'){
    message.channel.send('test complete')
  }
});

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const token = process.env.BOT_TOKEN;
client.login(token);