require('dotenv').config();
const axios = require('axios');
const token = process.env.ICON_API;

async function fetchGameIcon(gameName) {
  console.log('token is ' + token);
  try {
    const response = await axios.get(`https://api.rawg.io/api/games`, {
      params: {
        search: gameName,
        key: token,
      },
    });
    const results = response.data.results;
    if (results.length > 0) {
      const firstGame = results[0];
      const backgroundImage = firstGame.background_image;
      console.log('Background Image URL:', backgroundImage);
      return backgroundImage;
    } else {
      console.log('No games found.');
      return `https://imgur.com/a/6JiNJWp`;
    }
  } catch (error) {
    // An error occurred, log the error message
    console.error(error.message);
  }
}

module.exports = fetchGameIcon;