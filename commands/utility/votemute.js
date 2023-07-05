const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const customPhraseGenerator = require('../../utility/customPhraseGenerator');
const VoteDisplay = require('../../utility/votingRatioDisplay');
const imageMerger = require('../../utility/imageCombine')
let votemuteRunning = false;
let usersBeforeVoting = new Set();;
const path = require('path');

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
        if (votemuteRunning) {
            // The votemute command is already running, provide an appropriate response
            await interaction.reply({ content: 'The votemute command is already running.', ephemeral: true });
            return;
        }
        const voiceChannels = interaction.guild.channels.cache.filter(channel => channel.type === 2);
        const userVoiceChannel = interaction.member.voice.channel;
        if (userVoiceChannel) {
            const foundChannel = voiceChannels.find(channel => channel.id === userVoiceChannel.id);
            if (foundChannel) {
                console.log("Found user's voice channel:", foundChannel.name);
                foundChannel.members.forEach(member => {
                    usersBeforeVoting.add(member.user);
                });
            }
        } else {
            await interaction.reply({ content: 'Ты не в голосовом канале, так нельзя.', ephemeral: true });
            console.log("User is not in any voice channel");
            return;

        }
        let targetVoiceChannel;
        let maxMemberCount = 0;
        let userInVoiceChannel = false;
        voiceChannels.forEach(channel => {
            const memberCount = channel.members.size;
            console.log(channel.id + ` ` + memberCount)
            if (channel.members.has(interaction.user.id)) {
                userInVoiceChannel = true;
            }
            if (memberCount > maxMemberCount) {
                maxMemberCount = memberCount;
                targetVoiceChannel = channel;
            }
        });
        // Set the running state
        votemuteRunning = true;

        const guild = interaction.guild;
        const targetUser = interaction.options.getMember('targetuser');
        const muteReason = interaction.options.getString('reason') ?? 'Без причины';
        console.log('targetUser ' + targetUser)
        const targetUserName = targetUser.nickname;
        const votingMessage = customPhraseGenerator.getRandomMessage('vote', targetUserName)
        const avatarUrl = targetUser.displayAvatarURL({ dynamic: true });
        const votingEmbed = new EmbedBuilder()
            .setTitle(`Голосование за мут __**${targetUserName}**__`)
            .setDescription(votingMessage)
            .setColor('#ff0000')
            .addFields(
                { name: 'Причина:', value: `__*${muteReason}*__` },
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
        const filter = (interaction) => interaction.customId === 'buttonYes' || interaction.customId === 'buttonNo' && !interaction.user.bot;
        const collector = voteMessage.createMessageComponentCollector({ filter, time: 11000 });

        const votes = {
            yes: 0,
            no: 0
        };

        let usersVotedYes = new Set();;
        let usersVotedNo = new Set();;
        let votedYesCount = usersVotedYes.size ?? 0
        let votedNoCount = usersVotedNo.size ?? 0
        let timer = 10; // Starting time in seconds


        async function updateInteractionMessage() {
            const yess = new EmbedBuilder()
                .setTitle(`Голосование за мут __**${targetUserName}**__`)
                .setDescription(votingMessage)
                .setColor('#ff0000')
                .addFields(
                    { name: 'Причина:', value: `__*${muteReason}*__ TIME ${timer} cerk` }
                )
                .setImage(avatarUrl);

            await interaction.editReply({ embeds: [yess] });
        }
        const interval = setInterval(async () => {
            timer--;
            // Update the interaction message with the updated timer value
            await updateInteractionMessage();

            if (timer <= 0) {
                clearInterval(interval);
            }
        }, 1000);
        collector.on('collect', async (interaction) => {

            if (!usersBeforeVoting.has(interaction.member.user)) {
                await interaction.reply({ content: 'Тебя не было в голосовом канале до начала голосования, а может, ты не в канале и сейчас.', ephemeral: true });
                return;
            }
            const currentVotes = votedYesCount + votedNoCount;
            console.log('currentVotes!' + currentVotes)
            const user = interaction.user;
            const guild = interaction.guild;

            const member = guild.members.cache.get(user.id)
            const userVoiceChannel = member.voice.channel;

            console.log(`uservoicechannel ` + userVoiceChannel)

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
                    .setTitle(`Голосование за мут __**${targetUserName}**__`)
                    .setDescription(votingMessage)
                    .setColor('#ff0000')
                    .addFields(
                        { name: 'Причина:', value: `__*${muteReason}*__` },
                        { name: `За: **${votes.yes}** (${voteDisplay.yesPercentage}%)`, value: `${usersVotedYesStr}\n${bars[0]}` },
                        { name: `Против: **${votes.no}** (${voteDisplay.noPercentage}%)`, value: `${usersVotedNoStr}\n${bars[1]}` }
                    )
                    .setImage(avatarUrl);

                await interaction.update({ embeds: [updatedEmbed] });
            } else {
                console.log(interaction.user.username + ` not in the voice channel`)
            }

        });

        collector.on('end', async () => {
            votemuteRunning = false;
            imageMerger.mergeImages()
            if (votes.yes > votes.no) {
                await interaction.followUp(`За ${votes.yes}\t Против: ${votes.no}\n` + customPhraseGenerator.getRandomMessage('accept', targetUserName));
                console.log('muted')
                const attachment = new AttachmentBuilder(path.join(__dirname, '..','..', 'source', 'images', 'votemute-images', 'done' , 'done.png'), { name: 'done.png' })

                const updatedEmbed = new EmbedBuilder()
                    .setTitle(`**${targetUserName}** ВИНОВЕН`)
                    .setDescription(votingMessage)
                    .setColor('#ff0000')
                    .addFields(
                        { name: 'Причина:', value: `__*${muteReason}*__` },
                    )
                    .setImage('attachment://done.png');

                await interaction.editReply({ embeds: [updatedEmbed], files: [attachment] });
            } else {
                await interaction.followUp(`За ${votes.yes}\t Против: ${votes.no}\n` + customPhraseGenerator.getRandomMessage('deny', targetUserName));
            }
        });





    },
};