require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { addMessageToDb, addNicknameToDb , saveVoiceChatJoin ,saveVoiceChatLeave } = require('./utility/dbService.js')
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
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

client.on('ready', () => {
  const tokenAPI = process.env.ICON_API;
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`API TOK IS ${tokenAPI}`);
  const guildIds = client.guilds.cache.map((guild) => guild.id);

  console.log('Guild IDs:', guildIds);
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

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.displayName !== newMember.displayName) {
    const result = await addNicknameToDb(newMember.id, oldMember.displayName, newMember.displayName);
    console.log(result);
  }
});

// Event: Message received
client.on('messageCreate', async (message) => {
  // Check if the message starts with your bot's command prefix
  console.log(`Received message: ${message.content}`);
  // Ignore bot messages
  if (message.author.bot) return;
  const mentionedMembers = message.mentions.members; // Get a collection of mentioned members
  let mentionUserNames = []; // Create an empty array
  if (mentionedMembers.size > 0) {
    for (const mentionedMember of mentionedMembers.values()) {
      mentionUserNames.push(mentionedMember.user.username);
    }
  }
  let member = message.member;
  const result = await addMessageToDb(member.id, message.content, mentionUserNames);
  console.log(result);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelId !== newState.channelId) {
    if (newState.channel) {
      console.log(`${newState.member.user.tag} joined ${newState.channel.name}`);
      saveVoiceChatJoin(newState.member.user.id, newState.guild.id);
    } else {
      saveVoiceChatLeave(newState.member.user.id, oldState.guild.id);
      console.log(`${oldState.member.user.tag} left ${oldState.channel.name}`);
    }
    if (oldState.mute !== newState.mute) {
      if (newState.mute) {
        console.log(`${newState.member.user.tag} was muted in ${newState.channel.name}`);
        // Handle mute action
      } else {
        console.log(`${newState.member.user.tag} was unmuted in ${newState.channel.name}`);
        // Handle unmute action
      }
    }
  }
});
//token hidden in .env file due to privacy reasons
const token = process.env.BOT_TOKEN;
client.login(token);
