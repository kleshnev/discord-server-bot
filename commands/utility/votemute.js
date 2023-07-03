const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const customPhraseGenerator = require('../../utility/customPhraseGenerator');
const VoteDisplay = require('../../utility/votingRatioDisplay');


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
        const guild = interaction.guild;
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
                { name: 'За', value: `0` },
                { name: 'Против', value: `0` }
            )
            .setImage(avatarUrl);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Заглушить')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('buttonYes'),
                new ButtonBuilder()
                    .setLabel('Пощадить')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('buttonNo'));

        const voteMessage = await interaction.reply({ embeds: [votingEmbed], components: [row], fetchReply: true });
        //console.log(voteMessage + ' THIS IS VOTE MESSAGE')
        //await voteMessage.react('👍');
        //await voteMessage.react('👎');

        // const filter = (reaction, user) => {
        //     return ['👍', '👎'].includes(reaction.emoji.toString()) && !user.bot;
        // };

        // const collector = voteMessage.createReactionCollector({ filter, time: 10000 });

        const filter = (interaction) => interaction.customId === 'buttonYes' || interaction.customId === 'buttonNo' && !interaction.user.bot;

        const collector = voteMessage.createMessageComponentCollector({ filter });

        const votes = {
            yes: 0,
            no: 0
        };

        let usersVotedYes = new Set();;
        let usersVotedNo = new Set();;

        collector.on('collect', async (interaction,) => {

            const user = interaction.user;
            const guild = interaction.guild;

            const member = guild.members.cache.get(user.id)
            const userVoiceChannel = member.voice.channel;

            console.log(`uservoicechannel ` + userVoiceChannel)
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

            if (maxMemberCount == 0) {
                await interaction.reply(`Все голосовые каналы пусты.`)
            } else {
                console.log(`Voice channel with the most members: ${targetVoiceChannel.id}`);
                // Check if the user is in the target voice channel
                if (userVoiceChannel && userVoiceChannel.id === targetVoiceChannel.id) {

                    if (interaction.customId === 'buttonYes') {
                        usersVotedYes.add(interaction.user);
                        usersVotedNo.delete(interaction.user);
                        console.log(interaction.user.username + " clicked YES");
                    } else if (interaction.customId === 'buttonNo') {
                        usersVotedNo.add(interaction.user);
                        usersVotedYes.delete(interaction.user);
                        console.log(interaction.user.username + " clicked NO");
                    }
                    const updatedEmbed = new EmbedBuilder()
                        .setTitle('Голосование')
                        .setDescription(votingMessage)
                        .setColor('#ff0000')
                        .addFields(
                            { name: 'За', value: `${usersVotedYes.size}` },
                            { name: 'Против', value: `${usersVotedNo.size}` }
                        )
                        .setImage(avatarUrl);

                    await interaction.update({ embeds: [updatedEmbed] });
                } else {
                    console.log(interaction.user.username + ` not in the voice channel`)
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





    },
};