// Script to populate Firebase with sample data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDz2GSxB4nDILkxwj50v2tv_2oS2-UOoTk",
  authDomain: "tritontoryucsd.firebaseapp.com",
  projectId: "tritontoryucsd",
  storageBucket: "tritontoryucsd.firebasestorage.app",
  messagingSenderId: "948079256324",
  appId: "1:948079256324:web:605c196c385e8b06346651"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleArticles = [
  {
    title: "UCSD Announces New Sustainability Initiative",
    excerpt: "The university launches a comprehensive plan to achieve carbon neutrality by 2030.",
    content: "The University of California, San Diego has announced a groundbreaking sustainability initiative that aims to make the campus carbon neutral by 2030. This comprehensive plan includes renewable energy projects, sustainable transportation options, and waste reduction programs.",
    category: "Campus News",
    section: "News",
    authorName: "Sarah Johnson",
    coverImage: "https://picsum.photos/800/400?random=1",
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: "Student Government Elections: What You Need to Know",
    excerpt: "Everything about the upcoming AS elections and how to get involved.",
    content: "The Associated Students elections are just around the corner, and this year's race promises to be one of the most competitive in recent memory. With multiple candidates vying for key positions, students have more choices than ever.",
    category: "Student Life",
    section: "News",
    authorName: "Michael Chen",
    coverImage: "https://picsum.photos/800/400?random=2",
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: "Tritons Basketball Team Advances to Championship",
    excerpt: "Historic victory secures spot in conference finals for the first time in a decade.",
    content: "In a thrilling overtime victory, the UCSD Tritons basketball team has secured their spot in the conference championship game for the first time in over a decade. The team's remarkable turnaround season has captured the attention of the entire campus community.",
    category: "Sports",
    section: "Sports",
    authorName: "David Rodriguez",
    coverImage: "https://picsum.photos/800/400?random=3",
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const sampleVideos = [
  {
    title: "Campus Tour: Hidden Gems of UCSD",
    description: "Join us on a tour of the most beautiful and lesser-known spots on campus.",
    category: "Campus",
    authorName: "Campus Media Team",
    thumbnailUrl: "https://picsum.photos/400/600?random=5",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    duration: 45,
    views: 1250,
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: "Interview: Student Body President",
    description: "Exclusive interview with the current AS President about upcoming initiatives.",
    category: "Interview",
    authorName: "News Team",
    thumbnailUrl: "https://picsum.photos/400/600?random=6",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    duration: 60,
    views: 890,
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const sampleResearch = [
  {
    title: "Breakthrough in Alzheimer's Research",
    abstract: "Novel approach to early detection shows promising results in clinical trials.",
    content: "Researchers at UCSD have developed a new method for early detection of Alzheimer's disease that shows remarkable accuracy in clinical trials. This breakthrough could lead to earlier intervention and better outcomes for patients.",
    department: "Neuroscience",
    authorName: "Dr. Jennifer Martinez",
    coverImage: "https://picsum.photos/800/400?random=9",
    contributors: ["Dr. Robert Kim", "Dr. Lisa Wang"],
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: "Climate Change Impact on Marine Ecosystems",
    abstract: "Study reveals significant changes in Pacific Ocean biodiversity patterns.",
    content: "A comprehensive study of Pacific Ocean ecosystems has revealed significant changes in biodiversity patterns due to climate change. The research provides crucial data for conservation efforts.",
    department: "Marine Biology",
    authorName: "Dr. Carlos Mendez",
    coverImage: "https://picsum.photos/800/400?random=10",
    contributors: ["Dr. Sarah Thompson", "Dr. James Wilson"],
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const sampleLegalArticles = [
  {
    title: "Free Speech on Campus: Recent Developments",
    abstract: "Analysis of recent court decisions affecting student expression rights.",
    content: "Recent court decisions have significantly impacted the landscape of free speech on college campuses. This article analyzes the implications for UCSD students and administration.",
    category: "Constitutional Law",
    authorName: "Prof. Daniel Lee",
    coverImage: "https://picsum.photos/800/400?random=12",
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: "Student Privacy Rights in the Digital Age",
    abstract: "Examining how new technologies affect student privacy protections.",
    content: "As universities increasingly adopt digital technologies for education and administration, questions arise about student privacy rights and data protection.",
    category: "Privacy Law",
    authorName: "Prof. Rachel Green",
    coverImage: "https://picsum.photos/800/400?random=13",
    featured: true,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

// Populate collections
async function populateFirebase() {
  try {
    console.log('Starting Firebase population...');

    // Populate articles
    console.log('Adding articles...');
    for (const article of sampleArticles) {
      await addDoc(collection(db, "articles"), article);
    }

    // Populate videos
    console.log('Adding videos...');
    for (const video of sampleVideos) {
      await addDoc(collection(db, "videos"), video);
    }

    // Populate research
    console.log('Adding research articles...');
    for (const research of sampleResearch) {
      await addDoc(collection(db, "research"), research);
    }

    // Populate legal articles
    console.log('Adding legal articles...');
    for (const legal of sampleLegalArticles) {
      await addDoc(collection(db, "legal-articles"), legal);
    }

    console.log('✅ Firebase population completed successfully!');
  } catch (error) {
    console.error('❌ Error populating Firebase:', error);
  }
}

// Run the population script
populateFirebase(); 