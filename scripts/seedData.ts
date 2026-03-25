/**
 * Seed Script for FilmFlow
 * Populates the database with realistic sample data for screenshots
 * 
 * IMPORTANT: This script requires Firebase Admin SDK to bypass security rules
 * Run with: npx tsx scripts/seedData.ts
 * 
 * Prerequisites:
 * 1. Install: npm install firebase-admin dotenv
 * 2. Download service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS in .env
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccount) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS not set in .env');
  console.log('\n📝 To fix this:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the JSON file to your project root');
  console.log('4. Add to .env: GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccount))
});

const db = admin.firestore();

// Realistic movie titles with decision times
const movieSessions = [
  { title: 'The Grand Budapest Hotel', duration: 420, rating: 9 },
  { title: 'Inception', duration: 780, rating: 8 },
  { title: 'Parasite', duration: 540, rating: 10 },
  { title: 'Moonlight', duration: 360, rating: 9 },
  { title: 'Everything Everywhere All at Once', duration: 660, rating: 10 },
  { title: 'The Shawshank Redemption', duration: 300, rating: 9 },
  { title: 'Spirited Away', duration: 480, rating: 10 },
  { title: 'Amélie', duration: 390, rating: 8 },
  { title: 'The Social Network', duration: 720, rating: 7 },
  { title: 'Whiplash', duration: 510, rating: 9 },
  { title: 'Her', duration: 600, rating: 8 },
  { title: 'Mad Max: Fury Road', duration: 270, rating: 9 },
  { title: 'The Lighthouse', duration: 840, rating: 7 },
  { title: 'Knives Out', duration: 450, rating: 8 },
  { title: 'Portrait of a Lady on Fire', duration: 690, rating: 10 }
];

// Sample users with realistic data
const sampleUsers = [
  {
    id: 'user_emma_chen',
    email: 'emma.chen@example.com',
    displayName: 'Emma Chen',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    id: 'user_marcus_rivera',
    email: 'marcus.rivera@example.com',
    displayName: 'Marcus Rivera',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    id: 'user_sofia_patel',
    email: 'sofia.patel@example.com',
    displayName: 'Sofia Patel',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
  {
    id: 'user_james_kim',
    email: 'james.kim@example.com',
    displayName: 'James Kim',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  }
];

async function seedDatabase() {
  console.log('🎬 Starting FilmFlow database seeding...\n');

  try {
    // 1. Create Sample Household
    console.log('📦 Creating Sample Household...');
    const householdRef = await db.collection('households').add({
      name: 'The Movie Buffs',
      createdBy: sampleUsers[0].id,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      members: sampleUsers.map(u => u.id),
      inviteCode: 'DEMO42'
    });
    const householdId = householdRef.id;
    console.log(`✅ Household created: ${householdId}\n`);

    // 2. Create User Profiles
    console.log('👥 Creating user profiles...');
    for (const user of sampleUsers) {
      await db.collection('users').doc(user.id).set({
        email: user.email,
        displayName: user.displayName,
        householdId: householdId,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000))
      });
      console.log(`  ✓ ${user.displayName}`);
    }
    console.log('✅ User profiles created\n');

    // 3. Create Sessions (last 48 hours)
    console.log('🎥 Creating movie decision sessions...');
    const now = Date.now();
    const twoDaysAgo = now - (48 * 60 * 60 * 1000);
    
    let sessionCount = 0;
    for (let i = 0; i < 15; i++) {
      const movie = movieSessions[i % movieSessions.length];
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      // Random timestamp within last 48 hours
      const randomTime = twoDaysAgo + Math.random() * (now - twoDaysAgo);
      const sessionDate = new Date(randomTime);
      
      const sessionData: any = {
        title: movie.title,
        duration_seconds: movie.duration,
        rating: movie.rating,
        date: sessionDate.toISOString().split('T')[0],
        userId: randomUser.id,
        householdId: householdId,
        created_at: admin.firestore.Timestamp.fromDate(sessionDate)
      };
      
      // Only add optional fields if they have values
      if (movie.duration) sessionData.genre = 'Drama';
      if (movie.duration) sessionData.release_year = 2020 + Math.floor(Math.random() * 4);
      
      await db.collection('sessions').add(sessionData);
      
      sessionCount++;
      console.log(`  ✓ Session ${sessionCount}: ${movie.title} (${randomUser.displayName})`);
    }
    console.log(`✅ ${sessionCount} sessions created\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Household: "The Movie Buffs" (Code: DEMO42)`);
    console.log(`   • Users: ${sampleUsers.length}`);
    console.log(`   • Sessions: ${sessionCount}`);
    console.log('\n💡 You can now sign in with any of these emails (using Firebase Auth):');
    sampleUsers.forEach(u => console.log(`   • ${u.email}`));
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ All done! Your app is ready for screenshots.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
