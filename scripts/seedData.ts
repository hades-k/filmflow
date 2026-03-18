/**
 * Seed Script for FilmFlow
 * Populates the database with realistic sample data for screenshots
 * 
 * Run with: npx tsx scripts/seedData.ts
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';

// Firebase config - you'll need to add your config here
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    const householdRef = await addDoc(collection(db, 'households'), {
      name: 'The Movie Buffs',
      createdBy: sampleUsers[0].id,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      members: sampleUsers.map(u => u.id),
      inviteCode: 'DEMO42'
    });
    const householdId = householdRef.id;
    console.log(`✅ Household created: ${householdId}\n`);

    // 2. Create User Profiles
    console.log('👥 Creating user profiles...');
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.id), {
        email: user.email,
        displayName: user.displayName,
        householdId: householdId,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
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
      
      await addDoc(collection(db, 'sessions'), {
        title: movie.title,
        duration_seconds: movie.duration,
        rating: movie.rating,
        date: sessionDate.toISOString().split('T')[0],
        userId: randomUser.id,
        householdId: householdId,
        created_at: Timestamp.fromDate(sessionDate),
        genre: 'Drama',
        release_year: 2020 + Math.floor(Math.random() * 4)
      });
      
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
