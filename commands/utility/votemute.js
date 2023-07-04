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
        const votes = {
            yes: 0,
            no: 0
        };

        let usersVotedYes = new Set();;
        let usersVotedNo = new Set();;
        let votedYesCount = usersVotedYes.size ?? 0
        let votedNoCount = usersVotedNo.size ?? 0

        collector.on('collect', async (interaction,) => {
            const currentVotes = votedYesCount + votedNoCount;
            console.log('currentVotes!' + currentVotes)
            const user = interaction.user;
            const guild = interaction.guild;

            const member = guild.members.cache.get(user.id)
            const userVoiceChannel = member.voice.channel;

            console.log(`uservoicechannel ` + userVoiceChannel)


            if (maxMemberCount == 0) {
                await interaction.reply(`Все голосовые каналы пусты.`)
            } else {
                console.log(`Voice channel with the most members: ${targetVoiceChannel.id}`);
                // Check if the user is in the target voice channel
                if (userVoiceChannel && userVoiceChannel.id === targetVoiceChannel.id) {
                    let test = Array.from(usersVotedYes.values())
                        .map(user => user.username)
                        .join(", ");
                    console.log('current users voted yes:' + test)
                    let test2 = Array.from(usersVotedNo.values())
                        .map(user => user.username)
                        .join(", ");
                    console.log('current users voted no: ' + test2)
                    if (interaction.customId === 'buttonYes') {
                        console.log(interaction.user.username + " clicked YES");
                    
                        if (!usersVotedYes.has(interaction.user)) {
                            usersVotedYes.add(interaction.user);
                            votes.yes++;
                            console.log('vote YES counted');
                        }
                    
                        if (usersVotedNo.has(interaction.user)) {
                            usersVotedNo.delete(interaction.user);
                            votes.no--;
                            console.log('deleted vote NO');
                        }
                    } else if (interaction.customId === 'buttonNo') {
                        console.log(interaction.user.username + " clicked NO");
                    
                        if (!usersVotedNo.has(interaction.user)) {
                            usersVotedNo.add(interaction.user);
                            votes.no++;
                            console.log('vote NO counted');
                        }
                    
                        if (usersVotedYes.has(interaction.user)) {
                            usersVotedYes.delete(interaction.user);
                            votes.yes--;
                            console.log('deleted vote YES');
                        }
                    }
                    const memberCount = targetVoiceChannel.members.size;
                    const voteDisplay = new VoteDisplay(memberCount, votes.yes, votes.no);
                    console.log(`created vote display - all votes:${voteDisplay.usersCount}/votes yes: ${voteDisplay.yesPercentage}/votes no: ${voteDisplay.noPercentage}`)
                    const bars = voteDisplay.getVoteDisplay(2)
                    console.log(`created bars ${bars[0]}\n${bars[1]}`)
                    let usersVotedYesStr = Array.from(usersVotedYes.values())
                        .map(user => user.username)
                        .join(", ");
                    let usersVotedNoStr = Array.from(usersVotedNo.values())
                        .map(user => user.username)
                        .join(", ");

                    const updatedEmbed = new EmbedBuilder()
                        .setTitle('Голосование')
                        .setDescription(votingMessage)
                        .setColor('#ff0000')
                        .addFields(
                            { name: `За: **${votes.yes}**`, value: `${usersVotedYesStr}\n${bars[0]}` },
                            { name: `Против: **${votes.no}**`, value: `${usersVotedNoStr}\n${bars[1]}` }
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