/**
 * Quick script to generate placeholder icons for PWA
 * Run with: node generate-icons.js
 * 
 * This creates simple colored PNG files as placeholders.
 * For production, replace with proper branded icons.
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, size, size);
  
  // Film icon representation
  ctx.fillStyle = '#E4E3E0';
  
  // Simple film strip design
  const margin = size * 0.15;
  const width = size - (margin * 2);
  const height = size - (margin * 2);
  
  // Main rectangle
  ctx.fillRect(margin, margin, width, height);
  
  // Film holes
  ctx.fillStyle = '#0A0A0A';
  const holeSize = size * 0.08;
  const holeMargin = size * 0.05;
  
  for (let i = 0; i < 4; i++) {
    const y = margin + holeMargin + (i * (height - holeMargin * 2) / 3);
    ctx.fillRect(margin + holeMargin, y, holeSize, holeSize);
    ctx.fillRect(size - margin - holeMargin - holeSize, y, holeSize, holeSize);
  }
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

try {
  generateIcon(192, 'public/icon-192.png');
  generateIcon(512, 'public/icon-512.png');
  console.log('\n✓ Icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nTo use this script, install canvas:');
  console.log('  npm install canvas');
  console.log('\nOr create icons manually using:');
  console.log('  - Online tool: https://realfavicongenerator.net/');
  console.log('  - Design tool: Figma, Photoshop, etc.');
}
