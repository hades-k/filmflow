const sharp = require('sharp');
const fs = require('fs');

async function trimLogo() {
  try {
    const input = 'public/logo.png';
    const output = 'public/logo-trimmed.png';
    // Using an arbitrary threshold in case the background is not perfectly pure
    await sharp(input)
      .trim({ threshold: 25 })
      .toFile(output);
    
    // Copy back
    fs.renameSync(output, input);
    console.log('Logo trimmed successfully.');
  } catch (error) {
    console.error('Error trimming logo:', error);
    process.exit(1);
  }
}

trimLogo();
