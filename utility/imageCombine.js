const Jimp = require('jimp');
const path = require('path');

const catImagePath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'cat.png');
const barsImagePath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'bars.png');
const outputPath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'done', 'done.png');

async function mergeImages() {
    console.log('TESTTT!' + catImagePath,barsImagePath,outputPath)
  try {
    const catImage = await Jimp.read(catImagePath);
    const barsImage = await Jimp.read(barsImagePath);

    console.log('DONE!' + catImagePath,barsImagePath,outputPath)
    barsImage.resize(catImage.getWidth(), catImage.getHeight());

    catImage.composite(barsImage, 0, 0);

    await catImage.writeAsync(outputPath);

    console.log('Image saved successfully.');
  } catch (error) {
    console.error('Error merging images:', error);
  }
}

module.exports = {
    mergeImages
};