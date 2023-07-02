const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const customPhraseGenerator = require('../../utility/customPhraseGenerator');

// TODO null handling if user is not in channel
module.exports = {
    data: new SlashCommandBuilder()
        .setName('votemute')
        .setDescription('Голосование за отправление друга в мир тишины')
        .addUserOption(option =>
            option.setName('targetuser')
                .setDescription('Имя пользователя')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Причина')),
    async execute(interaction) {
        const targetUser = interaction.options.getMember('targetuser');
        const muteReason = interaction.options.getString('reason');
        console.log('targetUser ' + targetUser)
        const targetUserName = targetUser.nickname;
        const votingMessage = customPhraseGenerator.getRandomMessage('vote', targetUserName)
        const avatarUrl = targetUser.displayAvatarURL({ dynamic: true });
        const votingEmbed = new EmbedBuilder()
            .setTitle('Голосование')
            .setDescription(votingMessage)
            .setColor('#ff0000')
            .addFields(
                { name: 'За', value: `👍` },
                { name: 'Против', value: '👎' }
            )
            .setImage(avatarUrl);
        const voteMessage = await interaction.reply({ embeds: [votingEmbed], fetchReply: true });
        console.log(voteMessage + ' THIS IS VOTE MESSAGE')
        await voteMessage.react('👍');
        await voteMessage.react('👎');

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.toString()) && !user.bot;
        };

        const collector = voteMessage.createReactionCollector({ filter, time: 10000 });
        //const yesvotes = votingEmbed.reactions.cache.get('👍').count;
        // const novotes = votingEmbed.reactions.cache.get('👎').count;

        const votes = {
            yes: 0,
            no: 0
        };

        collector.on('collect', async (reaction, user) => {

            const userVoiceChannel = reaction.message.guild.members.cache.get(user.id).voice.channel;
            console.log(`uservoicechannel ` + userVoiceChannel.id)
            const voiceChannels = interaction.guild.channels.cache.filter(channel => channel.type === 2);
            let targetVoiceChannel;
            let maxMemberCount = 0;

            voiceChannels.forEach(channel => {
                const memberCount = channel.members.size;
                console.log(channel.id + ` ` + memberCount)
                if (memberCount > maxMemberCount) {
                    maxMemberCount = memberCount;
                    targetVoiceChannel = channel;
                }
            });

            console.log(`Voice channel with the most members: ${targetVoiceChannel.id}`);
            // Check if the user is in the target voice channel
            if (userVoiceChannel && userVoiceChannel.id === targetVoiceChannel.id) {

                if (reaction.emoji.name === '👍') {
                    votes.yes++;
                } else if (reaction.emoji.name === '👎') {
                    votes.no++;
                }
            }
        });

        collector.on('end', async () => {
            if (votes.yes > votes.no) {
                await interaction.followUp(`За ${votes.yes}\t Против: ${votes.no}\n` + customPhraseGenerator.getRandomMessage('accept', targetUserName));
                console.log('muted')
            } else {
                await interaction.followUp(`За ${votes.yes}\t Против: ${votes.no}\n` + customPhraseGenerator.getRandomMessage('deny', targetUserName));
            }
        });
        // overlayImages().catch((error) => {
        //     console.error('Error combining images:', error);
        // });
    },
};