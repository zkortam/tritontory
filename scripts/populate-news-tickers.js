const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleTickers = [
  {
    text: "BREAKING: UC San Diego announces new research initiative in renewable energy",
    priority: "breaking",
    isActive: true,
    link: "https://ucsd.edu",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    text: "Tritons basketball team advances to championship finals",
    priority: "high",
    isActive: true,
    link: "https://ucsdtritons.com",
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  {
    text: "Campus construction update: New student center opening next month",
    priority: "medium",
    isActive: true,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  },
  {
    text: "Student government elections: Voting opens tomorrow",
    priority: "high",
    isActive: true,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  {
    text: "Weather alert: Rain expected on campus this weekend",
    priority: "low",
    isActive: true,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  }
];

async function populateNewsTickers() {
  try {
    console.log('Starting to populate news tickers...');
    
    for (const ticker of sampleTickers) {
      await addDoc(collection(db, "newsTickers"), {
        ...ticker,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added ticker: ${ticker.text.substring(0, 50)}...`);
    }
    
    console.log('Successfully populated news tickers!');
  } catch (error) {
    console.error('Error populating news tickers:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the script
populateNewsTickers(); 