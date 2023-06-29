const { SlashCommandBuilder } = require('discord.js');



const replyArray =
    [`**USER** попал в зону 'Тишины'`,
        `Подготовьтесь к моменту тишины: **USER** заглушен!`,
        `Приготовьтесь, уважаемые участники, **USER** приступает к своей сольной выступлению в тишине. Пожелаем ему удачи!`,
        `Великая тишина надвигается на наш голосовой канал. **USER** стоит у ворот и открывает их для нашего покоя. Благодарим, **USER**!`,
        `О-оу, **USER**, ваши слова пропали в бездне Блэк Хола! Временное отключение вашей голосовой способности`,
        `Кажется, **USER** присоединился к 'Press F to Pay Respects' движению. Пусть его молчание будет самым искренним уважением!`
    ];

function getMuteMessage(user) {
    const randomIndex = Math.floor(Math.random() * replyArray.length);
    const templateString = replyArray[randomIndex];
    const muteMessage = templateString.replace('USER', user);
    return muteMessage;
}

// TODO add voting for muting
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
        console.log('targetUser ' + targetUser)
        const targetUserName = targetUser.nickname;
        await interaction.reply(getMuteMessage(targetUserName));
    },
};