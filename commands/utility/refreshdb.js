const { SlashCommandBuilder } = require('discord.js');
const { firestore } = require('../../firebase-admin');

const createUser = async (id, name) => {
    try {
        const usersCollection = firestore.collection('users');

        // Create a new document with id and name fields
        const userDoc = usersCollection.doc(id);
        console.log(`trying to create user ${name} with id: ${id}`)
        await userDoc.set({ id, name });

        // Create a Messages subcollection for the user
        const messagesCollection = userDoc.collection('Messages');

        // Example message data
        const messageData = {
            content: 'Hello, this is a message!',
            timestamp: new Date()
        };

        // Create a new message document in the Messages subcollection
        const messageDoc = messagesCollection.doc();
        await messageDoc.set(messageData);

        console.log('User and message created successfully!');
    } catch (error) {
        console.error('Error creating user:', error);
    }
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('refreshdb')
        .setDescription('Обновить базу данных и добавить новых пользователей'),
    async execute(interaction) {
        const guildId = interaction.guildId;
        const client = interaction.client;
        const guild = client.guilds.cache.get(guildId);
        let counter = 0;
        if (guild) {
            const memberCount = guild.memberCount;
            console.log('membercount ' + memberCount)
            const userCollectionRef = firestore.collection('users');
            let documentCount = 0;
            //counting users in database
            userCollectionRef
                .get()
                .then((querySnapshot) => {
                    documentCount = querySnapshot.size;
                    console.log('Document count:', documentCount);
                })
                .catch((error) => {
                    console.error('Error getting documents:', error);
                });
            console.log('dbUsersCount ' + documentCount)
            //if current users on server > users in database then starting to create new fields
            if (memberCount > documentCount) {
                //fetching non-cached users
                await guild.members.fetch();
                const members = Array.from(guild.members.cache.values());
                console.log(`members!: ${members}`)
                for (const member of members) {
                  const userCheckQuery = firestore.collection('users').where('id', '==', member.id);
                  console.log(`looking for ${member.id} in database...`)
                  const querySnapshot = await userCheckQuery.get();
                  const userInDbCount = querySnapshot.size;
                
                  //check if user is present in database and add if not
                  if (userInDbCount < 1) {
                    console.log(`${member.id} not found! creating...`)
                    await createUser(member.id, member.user.username);
                    counter++;
                  } else {
                    console.log(`User exists: ID: ${member.id}, Username: ${member.user.username}`);
                  }
                }
              } else {
                await interaction.reply('DB is up-to-date! Current users: ' + memberCount);
            }
            await interaction.reply(`Added ${counter} new users!`)
        }
    },

};