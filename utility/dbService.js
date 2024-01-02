const {firestore} = require('../firebase-admin');

const addMessageToDb = async (id, content, mentions) => {
    const date = new Date()
    console.log(`imitating db message add ID: ${id} / Content: ${content} / Date ${date} `)
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(id);
      const messagesCollection = userDoc.collection('Messages');
  
      // Create message data
      const messageData = {
        content: content,
        timestamp: getCurrentTimestamp(),
        mentionUserName: mentions
      };
  
      // Create a new message document in the Messages subcollection
      const messageDoc = messagesCollection.doc();
      await messageDoc.set(messageData);
      console.log('Message added successfully!', messageData);
    } catch (error) {
      console.error('Error addind message:', error);
    }
  };

  const addNicknameToDb = async (id, oldNickname , newNickname) => {
    const date = new Date()
    console.log(`imitating db nickname add ID: ${id} / Nickname ${oldNickname} --> ${newNickname} / Date ${date} `)
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(id);
      const messagesCollection = userDoc.collection('Nicknames');
  
      const data = {
        oldNickname: oldNickname,
        newNickname: newNickname,
        timestamp: getCurrentTimestamp()
      };
  
      const messageDoc = messagesCollection.doc();
      await messageDoc.set(data);
      console.log('Nickname added successfully!', data);
    } catch (error) {
      console.error('Error adding nickname:', error);
    }
  };

  const addUserActivityToDb = async (id, nickname) => {
    const date = new Date()
    console.log(`imitating db add ID: ${id} / Content: ${content} / Date ${date} `)
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(id);
      const messagesCollection = userDoc.collection('Activity');
  
      // Create message data
      const messageData = {
        content: content,
        nickname: nickname,
        timestamp: getCurrentTimestamp()
      };
  
      // Create a new message document in the Messages subcollection
      const messageDoc = messagesCollection.doc();
      await messageDoc.set(messageData);
      console.log('Nickname added successfully!', messageData);
    } catch (error) {
      console.error('Error adding nickname:', error);
    }
  };
  async function saveVoiceChatJoin(userId, guildId) {
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(userId);
      const voiceChatSessionsCollection = userDoc.collection('VoiceChatSessions');
  
      const existingSessionQuery = voiceChatSessionsCollection.where('guildId', '==', guildId).where('leaveTimestamp', '==', null);
      const existingSessionSnap = await existingSessionQuery.get();
  
      const data = {
        guildId,
        joinTimestamp: getCurrentTimestamp(),
        leaveTimestamp: null
      };
  
      if (existingSessionSnap.size > 0) {
        // Close the existing session
        await existingSessionSnap.docs[0].ref.update({ leaveTimestamp: getCurrentTimestamp() });
      }
  
      // Create a new session document, regardless of channel changes
      await voiceChatSessionsCollection.add(data);
    } catch (error) {
      console.error('Error saving voice chat join:', error);
    }
  }
  
  
  
  async function saveVoiceChatLeave(userId, guildId) {
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(userId);
      const voiceChatSessionsCollection = userDoc.collection('VoiceChatSessions');
  
      // Find the most recent voice chat session document for the guild and update its left timestamp
      const recentSessionQuery = voiceChatSessionsCollection.where('guildId', '==', guildId).orderBy('joinTimestamp', 'desc').limit(1);
      const recentSessionSnap = await recentSessionQuery.get();
  
      if (recentSessionSnap.size > 0) {
        const docRef = voiceChatSessionsCollection.doc(recentSessionSnap.docs[0].id);
        await docRef.update({ leaveTimestamp: getCurrentTimestamp() });
      } else {
        // Handle cases where join event might have been missed or data is inconsistent
        console.warn('Voice chat leave without a corresponding join:', userId, guildId);
      }
    } catch (error) {
      console.error('Error saving voice chat leave:', error);
    }
  }
  
  const addUserMuteToDb = async (id, nickname) => {
    const date = new Date()
    console.log(`imitating db add ID: ${id} / Content: ${content} / Date ${date} `)
    try {
      const usersCollection = firestore.collection('users');
      const userDoc = usersCollection.doc(id);
      const messagesCollection = userDoc.collection('Activity');
  
      // Create message data
      const messageData = {
        content: content,
        nickname: nickname,
        timestamp: getCurrentTimestamp()
      };
  
      // Create a new message document in the Messages subcollection
      const messageDoc = messagesCollection.doc();
      await messageDoc.set(messageData);
      console.log('Nickname added successfully!', messageData);
    } catch (error) {
      console.error('Error adding nickname:', error);
    }
  };


  const getCurrentTimestamp = () =>{
   return new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

  }

  module.exports = { addMessageToDb,addNicknameToDb , addUserActivityToDb , saveVoiceChatJoin , saveVoiceChatLeave };