const Jimp = require('jimp');
const path = require('path');
const sharp = require('sharp');

const catImagePath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'userAvatar.png');
const barsImagePath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'bars.png');
const outputPath = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'done', 'done.png');

async function mergeImages() {
  try {
    await sharp(catImagePath).toFormat('png').toFile(path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'userAvatar2.png'));
    console.log('Image converted successfully.');
  } catch (error) {
    console.error('Error converting image:', error);
  }
  console.log('TESTTT!' + catImagePath, barsImagePath, outputPath)
  try {
    const fixedImage = path.join(__dirname, '..', 'source', 'images', 'votemute-images', 'raw', 'userAvatar2.png')
    const catImage = await Jimp.read(fixedImage);
    const barsImage = await Jimp.read(barsImagePath);

    console.log('DONE!' + fixedImage, barsImagePath, outputPath)
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