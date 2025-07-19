import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
  query as firestoreQuery,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Article, Video, Research, LegalArticle, UserProfile, Comment, Settings, NewsTicker } from "./models";
import { SportBanner, SportBannerSettings, Substitution, GameHighlight } from "./models";
import { auth } from "./firebase";

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Generic upload file function
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Generic delete file function
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Article Service for Triton Tory
export const ArticleService = {
  // Get all articles with optional filtering
  getArticles: async (
    categoryFilter?: string,
    sectionFilter?: string,
    featuredOnly: boolean = false,
    limitCount: number = 10
  ): Promise<Article[]> => {
    try {
      const articlesQuery = collection(db, "articles");
      const queryConstraints = [];

      if (categoryFilter) {
        queryConstraints.push(where("category", "==", categoryFilter));
      }

      if (sectionFilter) {
        queryConstraints.push(where("section", "==", sectionFilter));
      }

      if (featuredOnly) {
        queryConstraints.push(where("featured", "==", true));
      }

      // Only show published articles
      queryConstraints.push(where("status", "==", "published"));

      // Order by published date
      queryConstraints.push(orderBy("publishedAt", "desc"));

      // Limit results
      queryConstraints.push(firestoreLimit(limitCount));

      const q = firestoreQuery(articlesQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const articles: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Article);
      });

      return articles;
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  },

  // Get all articles for admin (including drafts and unpublished)
  getAllArticles: async (): Promise<Article[]> => {
    try {
      const articlesQuery = collection(db, "articles");
      const q = firestoreQuery(articlesQuery, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const articles: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        articles.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Article);
      });

      return articles;
    } catch (error) {
      console.error("Error fetching all articles:", error);
      return [];
    }
  },

  // Get a single article by ID
  getArticle: async (id: string): Promise<Article | null> => {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishedAt: convertTimestampToDate(data.publishedAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as Article;
    }

    return null;
  },

  // Create a new article
  createArticle: async (article: Omit<Article, "id" | "publishedAt" | "updatedAt">, coverImageFile?: File): Promise<string> => {
    // Upload cover image if provided
    let coverImage = article.coverImage;

    if (coverImageFile) {
      const imagePath = `articles/${Date.now()}_${coverImageFile.name}`;
      coverImage = await uploadFile(coverImageFile, imagePath);
    }

    const docRef = await addDoc(collection(db, "articles"), {
      ...article,
      coverImage,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // Update an existing article
  updateArticle: async (id: string, article: Partial<Article>, coverImageFile?: File): Promise<void> => {
    const docRef = doc(db, "articles", id);

    // Upload new cover image if provided
    if (coverImageFile) {
      const imagePath = `articles/${Date.now()}_${coverImageFile.name}`;
      article.coverImage = await uploadFile(coverImageFile, imagePath);
    }

    // Filter out undefined values to prevent Firebase errors
    const cleanArticle = Object.fromEntries(
      Object.entries(article).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanArticle,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete an article
  deleteArticle: async (id: string): Promise<void> => {
    const docRef = doc(db, "articles", id);
    await deleteDoc(docRef);
  }
};

// Video Service for Triton Today
export const VideoService = {
  // Get all videos with optional filtering
  getVideos: async (
    categoryFilter?: string,
    featuredOnly: boolean = false,
    limitCount: number = 10
  ): Promise<Video[]> => {
    try {
      const videosQuery = collection(db, "videos");
      const queryConstraints = [];

      if (categoryFilter) {
        queryConstraints.push(where("category", "==", categoryFilter));
      }

      if (featuredOnly) {
        queryConstraints.push(where("featured", "==", true));
      }

      // Only show published videos
      queryConstraints.push(where("status", "==", "published"));

      // Order by published date
      queryConstraints.push(orderBy("publishedAt", "desc"));

      // Limit results
      queryConstraints.push(firestoreLimit(limitCount));

      const q = firestoreQuery(videosQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const videos: Video[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Video);
      });

      return videos;
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  },

  // Get all videos for admin (including drafts and unpublished)
  getAllVideos: async (): Promise<Video[]> => {
    try {
      const videosQuery = collection(db, "videos");
      const q = firestoreQuery(videosQuery, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const videos: Video[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Video);
      });

      return videos;
    } catch (error) {
      console.error("Error fetching all videos:", error);
      return [];
    }
  },

  // Get a single video by ID
  getVideo: async (id: string): Promise<Video | null> => {
    const docRef = doc(db, "videos", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishedAt: convertTimestampToDate(data.publishedAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as Video;
    }

    return null;
  },

  // Create a new video
  createVideo: async (
    video: Omit<Video, "id" | "publishedAt" | "updatedAt" | "videoUrl" | "thumbnailUrl" | "views">,
    videoFile: File,
    thumbnailFile: File
  ): Promise<string> => {
    // Upload video file
    const videoPath = `videos/${Date.now()}_${videoFile.name}`;
    const videoUrl = await uploadFile(videoFile, videoPath);

    // Upload thumbnail
    const thumbnailPath = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
    const thumbnailUrl = await uploadFile(thumbnailFile, thumbnailPath);

    const docRef = await addDoc(collection(db, "videos"), {
      ...video,
      videoUrl,
      thumbnailUrl,
      views: 0,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // Update an existing video
  updateVideo: async (
    id: string,
    video: Partial<Video>,
    videoFile?: File,
    thumbnailFile?: File
  ): Promise<void> => {
    const docRef = doc(db, "videos", id);

    // Upload new video if provided
    if (videoFile) {
      const videoPath = `videos/${Date.now()}_${videoFile.name}`;
      video.videoUrl = await uploadFile(videoFile, videoPath);
    }

    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const thumbnailPath = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
      video.thumbnailUrl = await uploadFile(thumbnailFile, thumbnailPath);
    }

    // Filter out undefined values to prevent Firebase errors
    const cleanVideo = Object.fromEntries(
      Object.entries(video).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanVideo,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete a video
  deleteVideo: async (id: string): Promise<void> => {
    const docRef = doc(db, "videos", id);
    await deleteDoc(docRef);
  },

  // Increment view count
  incrementViews: async (id: string): Promise<void> => {
    const docRef = doc(db, "videos", id);
    await updateDoc(docRef, {
      views: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
};

// Research Service for Science Journal
export const ResearchService = {
  // Get all research articles with optional filtering
  getResearchArticles: async (
    departmentFilter?: string,
    featuredOnly: boolean = false,
    limitCount: number = 10
  ): Promise<Research[]> => {
    try {
      const researchQuery = collection(db, "research");
      const queryConstraints = [];

      if (departmentFilter) {
        queryConstraints.push(where("department", "==", departmentFilter));
      }

      if (featuredOnly) {
        queryConstraints.push(where("featured", "==", true));
      }

      // Only show published research
      queryConstraints.push(where("status", "==", "published"));

      // Order by published date
      queryConstraints.push(orderBy("publishedAt", "desc"));

      // Limit results
      queryConstraints.push(firestoreLimit(limitCount));

      const q = firestoreQuery(researchQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const research: Research[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        research.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Research);
      });

      return research;
    } catch (error) {
      console.error("Error fetching research:", error);
      return [];
    }
  },

  // Get all research articles for admin (including drafts and unpublished)
  getAllResearchArticles: async (): Promise<Research[]> => {
    try {
      const researchQuery = collection(db, "research");
      const q = firestoreQuery(researchQuery, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const research: Research[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        research.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Research);
      });

      return research;
    } catch (error) {
      console.error("Error fetching all research:", error);
      return [];
    }
  },

  // Get a single research article by ID
  getResearchArticle: async (id: string): Promise<Research | null> => {
    const docRef = doc(db, "research", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishedAt: convertTimestampToDate(data.publishedAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as Research;
    }

    return null;
  },

  // Create a new research article
  createResearchArticle: async (
    research: Omit<Research, "id" | "publishedAt" | "updatedAt">,
    coverImageFile?: File
  ): Promise<string> => {
    // Upload cover image if provided
    let coverImage = research.coverImage;

    if (coverImageFile) {
      const imagePath = `research/${Date.now()}_${coverImageFile.name}`;
      coverImage = await uploadFile(coverImageFile, imagePath);
    }

    const docRef = await addDoc(collection(db, "research"), {
      ...research,
      coverImage,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // Update an existing research article
  updateResearchArticle: async (
    id: string,
    research: Partial<Research>,
    coverImageFile?: File
  ): Promise<void> => {
    const docRef = doc(db, "research", id);

    // Upload new cover image if provided
    if (coverImageFile) {
      const imagePath = `research/${Date.now()}_${coverImageFile.name}`;
      research.coverImage = await uploadFile(coverImageFile, imagePath);
    }

    // Filter out undefined values to prevent Firebase errors
    const cleanResearch = Object.fromEntries(
      Object.entries(research).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanResearch,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete a research article
  deleteResearchArticle: async (id: string): Promise<void> => {
    const docRef = doc(db, "research", id);
    await deleteDoc(docRef);
  }
};

// Legal Article Service for Law Review
export const LegalService = {
  // Get all legal articles with optional filtering
  getLegalArticles: async (
    categoryFilter?: string,
    featuredOnly: boolean = false,
    limitCount: number = 10
  ): Promise<LegalArticle[]> => {
    try {
      const legalQuery = collection(db, "legal-articles");
      const queryConstraints = [];

      if (categoryFilter) {
        queryConstraints.push(where("category", "==", categoryFilter));
      }

      if (featuredOnly) {
        queryConstraints.push(where("featured", "==", true));
      }

      // Only show published legal articles
      queryConstraints.push(where("status", "==", "published"));

      // Order by published date
      queryConstraints.push(orderBy("publishedAt", "desc"));

      // Limit results
      queryConstraints.push(firestoreLimit(limitCount));

      const q = firestoreQuery(legalQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const legalArticles: LegalArticle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        legalArticles.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as LegalArticle);
      });

      return legalArticles;
    } catch (error) {
      console.error("Error fetching legal articles:", error);
      return [];
    }
  },

  // Get all legal articles for admin (including drafts and unpublished)
  getAllLegalArticles: async (): Promise<LegalArticle[]> => {
    try {
      const legalQuery = collection(db, "legal-articles");
      const q = firestoreQuery(legalQuery, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const legalArticles: LegalArticle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        legalArticles.push({
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as LegalArticle);
      });

      return legalArticles;
    } catch (error) {
      console.error("Error fetching all legal articles:", error);
      return [];
    }
  },

  // Get a single legal article by ID
  getLegalArticle: async (id: string): Promise<LegalArticle | null> => {
    const docRef = doc(db, "legal-articles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishedAt: convertTimestampToDate(data.publishedAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as LegalArticle;
    }

    return null;
  },

  // Create a new legal article
  createLegalArticle: async (
    legalArticle: Omit<LegalArticle, "id" | "publishedAt" | "updatedAt">,
    coverImageFile?: File
  ): Promise<string> => {
    // Upload cover image if provided
    let coverImage = legalArticle.coverImage;

    if (coverImageFile) {
      const imagePath = `legal-articles/${Date.now()}_${coverImageFile.name}`;
      coverImage = await uploadFile(coverImageFile, imagePath);
    }

    const docRef = await addDoc(collection(db, "legal-articles"), {
      ...legalArticle,
      coverImage,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // Update an existing legal article
  updateLegalArticle: async (
    id: string,
    legalArticle: Partial<LegalArticle>,
    coverImageFile?: File
  ): Promise<void> => {
    const docRef = doc(db, "legal-articles", id);

    // Upload new cover image if provided
    if (coverImageFile) {
      const imagePath = `legal-articles/${Date.now()}_${coverImageFile.name}`;
      legalArticle.coverImage = await uploadFile(coverImageFile, imagePath);
    }

    // Filter out undefined values to prevent Firebase errors
    const cleanLegalArticle = Object.fromEntries(
      Object.entries(legalArticle).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanLegalArticle,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete a legal article
  deleteLegalArticle: async (id: string): Promise<void> => {
    const docRef = doc(db, "legal-articles", id);
    await deleteDoc(docRef);
  }
};

// User Service for Admin User Management
export const UserService = {
  // Get all users from Firestore
  getUsers: async (): Promise<UserProfile[]> => {
    const usersQuery = collection(db, "user-profiles");
    const querySnapshot = await getDocs(usersQuery);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        id: doc.id,
        joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(),
      } as UserProfile);
    });
    return users;
  },

  // Create a new user in Firestore
  createUser: async (user: Omit<UserProfile, "id" | "joinedAt">): Promise<string> => {
    const docRef = await addDoc(collection(db, "user-profiles"), {
      ...user,
      joinedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update an existing user in Firestore
  updateUser: async (id: string, user: Partial<UserProfile>): Promise<void> => {
    const docRef = doc(db, "user-profiles", id);
    await updateDoc(docRef, user);
  },

  // Delete a user from Firestore
  deleteUser: async (id: string): Promise<void> => {
    const docRef = doc(db, "user-profiles", id);
    await deleteDoc(docRef);
  },
};

// Settings Service for Admin Settings Management
export const SettingsService = {
  // Get all settings from Firestore
  getSettings: async (): Promise<Settings> => {
    try {
      const settingsQuery = collection(db, "settings");
      const querySnapshot = await getDocs(settingsQuery);
      
      if (querySnapshot.empty) {
        // Return default settings if none exist
        return {
          siteName: "Triton Tory Media",
          siteDescription: "The comprehensive voice of UC San Diego",
          contactEmail: "contact@tritontory.com",
          maxFileSize: "10",
          enableComments: true,
          requireApproval: true,
          autoPublish: false,
          newContentAlerts: true,
          errorNotifications: true,
          weeklyReports: false,
          version: "1.0.0",
          lastUpdated: new Date(),
          status: "Online"
        };
      }

      // Combine all settings documents into one object
      const settings: Record<string, unknown> = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        settings[doc.id] = data.value !== undefined ? data.value : data;
      });

      // Convert to Settings type with proper defaults
      return {
        siteName: (settings.siteName as string) || "Triton Tory Media",
        siteDescription: (settings.siteDescription as string) || "The comprehensive voice of UC San Diego",
        contactEmail: (settings.contactEmail as string) || "contact@tritontory.com",
        maxFileSize: (settings.maxFileSize as string) || "10",
        enableComments: (settings.enableComments as boolean) ?? true,
        requireApproval: (settings.requireApproval as boolean) ?? true,
        autoPublish: (settings.autoPublish as boolean) ?? false,
        newContentAlerts: (settings.newContentAlerts as boolean) ?? true,
        errorNotifications: (settings.errorNotifications as boolean) ?? true,
        weeklyReports: (settings.weeklyReports as boolean) ?? false,
        version: (settings.version as string) || "1.0.0",
        lastUpdated: (settings.lastUpdated as Date) || new Date(),
        status: (settings.status as string) || "Online"
      };
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },

  // Save a setting to Firestore
  saveSetting: async (key: string, value: unknown): Promise<void> => {
    try {
      const docRef = doc(db, "settings", key);
      await setDoc(docRef, {
        value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving setting:", error);
      throw error;
    }
  },

  // Save multiple settings at once
  saveSettings: async (settings: Settings): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      Object.entries(settings).forEach(([key, value]) => {
        const docRef = doc(db, "settings", key);
        batch.set(docRef, {
          value,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  },

  // Delete a setting
  deleteSetting: async (key: string): Promise<void> => {
    try {
      const docRef = doc(db, "settings", key);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting setting:", error);
      throw error;
    }
  },
};

// User Profile Service
export const UserProfileService = {
  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "user-profiles", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          joinedAt: convertTimestampToDate(data.joinedAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
          readingHistory: data.readingHistory?.map((item: Record<string, unknown>) => ({
            ...item,
            readAt: convertTimestampToDate(item.readAt as Timestamp),
          })) || [],
          authoredContent: data.authoredContent?.map((item: Record<string, unknown>) => ({
            ...item,
            publishedAt: convertTimestampToDate(item.publishedAt as Timestamp),
          })) || [],
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  // Create or update user profile
  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
    try {
      const docRef = doc(db, "user-profiles", userId);
      await setDoc(docRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Add content to reading history
  addToReadingHistory: async (
    userId: string,
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    readTime?: number
  ): Promise<void> => {
    try {
      const docRef = doc(db, "user-profiles", userId);
      const historyEntry = {
        contentId,
        contentType,
        readAt: serverTimestamp(),
        ...(readTime && { readTime }),
      };

      await updateDoc(docRef, {
        readingHistory: arrayUnion(historyEntry),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding to reading history:", error);
    }
  },

  // Get user's reading history
  getReadingHistory: async (userId: string, limit: number = 20): Promise<Array<{
    contentId: string;
    contentType: 'article' | 'video' | 'research' | 'legal';
    readAt: Date;
    readTime?: number;
  }>> => {
    try {
      const profile = await UserProfileService.getUserProfile(userId);
      if (!profile) return [];

      return profile.readingHistory
        .sort((a, b) => b.readAt.getTime() - a.readAt.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching reading history:", error);
      return [];
    }
  },

  // Follow a user, topic, or department
  follow: async (
    followerId: string,
    followingId: string,
    followType: 'user' | 'topic' | 'department'
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Create follow record
      const followRef = doc(collection(db, "follows"));
      batch.set(followRef, {
        followerId,
        followingId,
        followType,
        createdAt: serverTimestamp(),
      });

      // Update follower's profile
      const followerRef = doc(db, "user-profiles", followerId);
      batch.update(followerRef, {
        following: arrayUnion(followingId),
        [`following${followType.charAt(0).toUpperCase() + followType.slice(1)}s`]: arrayUnion(followingId),
        updatedAt: serverTimestamp(),
      });

      // Update following user's profile (if following a user)
      if (followType === 'user') {
        const followingRef = doc(db, "user-profiles", followingId);
        batch.update(followingRef, {
          followers: arrayUnion(followerId),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error following:", error);
      throw error;
    }
  },

  // Unfollow a user, topic, or department
  unfollow: async (
    followerId: string,
    followingId: string,
    followType: 'user' | 'topic' | 'department'
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Delete follow record
      const followsQuery = firestoreQuery(
        collection(db, "follows"),
        where("followerId", "==", followerId),
        where("followingId", "==", followingId),
        where("followType", "==", followType)
      );
      const followsSnapshot = await getDocs(followsQuery);
      followsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Update follower's profile
      const followerRef = doc(db, "user-profiles", followerId);
      batch.update(followerRef, {
        following: arrayRemove(followingId),
        [`following${followType.charAt(0).toUpperCase() + followType.slice(1)}s`]: arrayRemove(followingId),
        updatedAt: serverTimestamp(),
      });

      // Update following user's profile (if unfollowing a user)
      if (followType === 'user') {
        const followingRef = doc(db, "user-profiles", followingId);
        batch.update(followingRef, {
          followers: arrayRemove(followerId),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error unfollowing:", error);
      throw error;
    }
  },

  // Check if user is following
  isFollowing: async (
    followerId: string,
    followingId: string,
    followType: 'user' | 'topic' | 'department'
  ): Promise<boolean> => {
    try {
      const followsQuery = firestoreQuery(
        collection(db, "follows"),
        where("followerId", "==", followerId),
        where("followingId", "==", followingId),
        where("followType", "==", followType)
      );
      const snapshot = await getDocs(followsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  },

  // Get user's followers
  getFollowers: async (userId: string, limit: number = 20): Promise<UserProfile[]> => {
    try {
      const profile = await UserProfileService.getUserProfile(userId);
      if (!profile) return [];

      const followers: UserProfile[] = [];
      for (const followerId of profile.followers.slice(0, limit)) {
        const follower = await UserProfileService.getUserProfile(followerId);
        if (follower) followers.push(follower);
      }

      return followers;
    } catch (error) {
      console.error("Error fetching followers:", error);
      return [];
    }
  },

  // Get users that a user is following
  getFollowing: async (userId: string, limit: number = 20): Promise<UserProfile[]> => {
    try {
      const profile = await UserProfileService.getUserProfile(userId);
      if (!profile) return [];

      const following: UserProfile[] = [];
      for (const followingId of profile.following.slice(0, limit)) {
        const followingUser = await UserProfileService.getUserProfile(followingId);
        if (followingUser) following.push(followingUser);
      }

      return following;
    } catch (error) {
      console.error("Error fetching following:", error);
      return [];
    }
  },
};

// Enhanced Comment Service with threading
export const CommentService = {
  // Get comments for content with threading
  getComments: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    limit: number = 50
  ): Promise<Comment[]> => {
    try {
      const commentsQuery = collection(db, "comments");
      const q = firestoreQuery(
        commentsQuery,
        where("contentId", "==", contentId),
        where("contentType", "==", contentType),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        firestoreLimit(limit)
      );

      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          ...data,
          id: doc.id,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Comment);
      });

      // Organize comments into threaded structure
      return CommentService.organizeThreadedComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  // Organize comments into threaded structure
  organizeThreadedComments(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Organize into threaded structure
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment.id);
        }
      } else {
        topLevelComments.push(commentMap.get(comment.id)!);
      }
    });

    return topLevelComments;
  },

  // Add a comment
  addComment: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    authorId: string,
    authorName: string,
    content: string,
    parentId?: string
  ): Promise<string> => {
    try {
      const parentComment = parentId ? await CommentService.getComment(parentId) : null;
      const depth = parentComment ? parentComment.depth + 1 : 0;

      const commentData = {
        contentId,
        contentType,
        authorId,
        authorName,
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending' as const,
        parentId,
        replies: [],
        depth,
        likes: 0,
        likedBy: [],
        isEdited: false,
      };

      const docRef = await addDoc(collection(db, "comments"), commentData);

      // Update parent comment's replies array
      if (parentId) {
        const parentRef = doc(db, "comments", parentId);
        await updateDoc(parentRef, {
          replies: arrayUnion(docRef.id),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Get a single comment
  getComment: async (commentId: string): Promise<Comment | null> => {
    try {
      const docRef = doc(db, "comments", commentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Comment;
      }

      return null;
    } catch (error) {
      console.error("Error fetching comment:", error);
      return null;
    }
  },

  // Like/unlike a comment
  toggleCommentLike: async (commentId: string, userId: string): Promise<void> => {
    try {
      const commentRef = doc(db, "comments", commentId);
      const comment = await CommentService.getComment(commentId);

      if (!comment) throw new Error("Comment not found");

      const isLiked = comment.likedBy.includes(userId);

      await updateDoc(commentRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error toggling comment like:", error);
      throw error;
    }
  },

  // Edit a comment
  editComment: async (commentId: string, newContent: string): Promise<void> => {
    try {
      const commentRef = doc(db, "comments", commentId);
      const comment = await CommentService.getComment(commentId);

      if (!comment) throw new Error("Comment not found");

      const editHistory = comment.editHistory || [];
      editHistory.push({
        content: comment.content,
        editedAt: new Date(),
      });

      await updateDoc(commentRef, {
        content: newContent,
        isEdited: true,
        editHistory,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get all comments for admin moderation
  getAllComments: async (status?: 'pending' | 'approved' | 'rejected'): Promise<Comment[]> => {
    try {
      const commentsQuery = collection(db, "comments");
      const queryConstraints = [];

      if (status) {
        queryConstraints.push(where("status", "==", status));
      }

      queryConstraints.push(orderBy("createdAt", "desc"));

      const q = firestoreQuery(commentsQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          ...data,
          id: doc.id,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Comment);
      });

      return comments;
    } catch (error) {
      console.error("Error fetching all comments:", error);
      return [];
    }
  },

  // Update comment status for moderation
  updateCommentStatus: async (commentId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating comment status:", error);
      throw error;
    }
  },
};

// Enhanced Search Service with faceted search and autocomplete
export const EnhancedSearchService = {
  // Faceted search with filters
  facetedSearch: async (
    query: string,
    filters: {
      dateRange?: string;
      category?: string;
      author?: string;
      tags?: string[];
      popularity?: string;
      contentType?: 'article' | 'video' | 'research' | 'legal';
    },
    limit: number = 20
  ): Promise<Array<{
    id: string;
    type: 'article' | 'video' | 'research' | 'legal';
    title: string;
    excerpt?: string;
    description?: string;
    abstract?: string;
    category: string;
    publishedAt: Date;
    authorName: string;
    coverImage?: string;
    thumbnailUrl?: string;
    views?: number;
    likes: number;
    department?: string;
  }>> => {
    try {
      const searchTerm = query.toLowerCase().trim();
      const results: Array<{
        id: string;
        type: 'article' | 'video' | 'research' | 'legal';
        title: string;
        excerpt?: string;
        description?: string;
        abstract?: string;
        category: string;
        publishedAt: Date;
        authorName: string;
        coverImage?: string;
        thumbnailUrl?: string;
        views?: number;
        likes: number;
        department?: string;
      }> = [];

      // Search articles
      if (!filters.contentType || filters.contentType === 'article') {
        const articlesQuery = collection(db, "articles");
        const queryConstraints = [
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit * 2)
        ];

        if (filters.category) {
          queryConstraints.push(where("category", "==", filters.category));
        }
        if (filters.author) {
          queryConstraints.push(where("authorName", "==", filters.author));
        }
        if (filters.tags && filters.tags.length > 0) {
          queryConstraints.push(where("tags", "array-contains-any", filters.tags));
        }

        const q = firestoreQuery(articlesQuery, ...queryConstraints);
        const articlesSnapshot = await getDocs(q);

        articlesSnapshot.forEach((doc) => {
          const data = doc.data();
          const article = {
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
          } as Article;

          if (EnhancedSearchService.matchesSearch(article, searchTerm)) {
            results.push({
              id: article.id,
              type: 'article',
              title: article.title,
              excerpt: article.excerpt,
              category: article.category,
              publishedAt: article.publishedAt,
              authorName: article.authorName,
              coverImage: article.coverImage,
              likes: article.likes || 0,
            });
          }
        });
      }

      // Search videos
      if (!filters.contentType || filters.contentType === 'video') {
        const videosQuery = collection(db, "videos");
        const queryConstraints = [
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit * 2)
        ];

        if (filters.category) {
          queryConstraints.push(where("category", "==", filters.category));
        }
        if (filters.author) {
          queryConstraints.push(where("authorName", "==", filters.author));
        }

        const q = firestoreQuery(videosQuery, ...queryConstraints);
        const videosSnapshot = await getDocs(q);

        videosSnapshot.forEach((doc) => {
          const data = doc.data();
          const video = {
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
          } as Video;

          if (EnhancedSearchService.matchesSearch(video, searchTerm)) {
            results.push({
              id: video.id,
              type: 'video',
              title: video.title,
              description: video.description,
              category: video.category,
              publishedAt: video.publishedAt,
              authorName: video.authorName,
              thumbnailUrl: video.thumbnailUrl,
              views: video.views,
              likes: video.likes || 0,
            });
          }
        });
      }

      // Search research
      if (!filters.contentType || filters.contentType === 'research') {
        const researchQuery = collection(db, "research");
        const queryConstraints = [
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit * 2)
        ];

        if (filters.category) {
          queryConstraints.push(where("department", "==", filters.category));
        }
        if (filters.author) {
          queryConstraints.push(where("authorName", "==", filters.author));
        }
        if (filters.tags && filters.tags.length > 0) {
          queryConstraints.push(where("tags", "array-contains-any", filters.tags));
        }

        const q = firestoreQuery(researchQuery, ...queryConstraints);
        const researchSnapshot = await getDocs(q);

        researchSnapshot.forEach((doc) => {
          const data = doc.data();
          const research = {
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
          } as Research;

          if (EnhancedSearchService.matchesSearch(research, searchTerm)) {
            results.push({
              id: research.id,
              type: 'research',
              title: research.title,
              abstract: research.abstract,
              category: research.department,
              publishedAt: research.publishedAt,
              authorName: research.authorName,
              coverImage: research.coverImage,
              department: research.department,
              likes: research.likes || 0,
            });
          }
        });
      }

      // Apply date range filter
      if (filters.dateRange) {
        const now = new Date();
        let cutoffDate: Date;
        
        switch (filters.dateRange) {
          case 'today':
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }

        const filteredResults = results.filter(result => result.publishedAt >= cutoffDate);
        results.length = 0;
        results.push(...filteredResults);
      }

      // Apply popularity filter
      if (filters.popularity) {
        results.sort((a, b) => {
          switch (filters.popularity) {
            case 'most-liked':
              return b.likes - a.likes;
            case 'most-viewed':
              return (b.views || 0) - (a.views || 0);
            case 'recent':
              return b.publishedAt.getTime() - a.publishedAt.getTime();
            default:
              return 0;
          }
        });
      }

      // Sort by relevance and return limited results
      return EnhancedSearchService.sortByRelevance(results, searchTerm).slice(0, limit);

    } catch (error) {
      console.error("Error in faceted search:", error);
      return [];
    }
  },

  // Get search suggestions based on popular queries
  getSearchSuggestions: async (query: string, limit: number = 5): Promise<string[]> => {
    try {
      const suggestions: string[] = [];
      
      // Get popular categories
      const articlesQuery = collection(db, "articles");
      const articlesSnapshot = await getDocs(
        firestoreQuery(
          articlesQuery,
          where("status", "==", "published"),
          where("featured", "==", true),
          orderBy("publishedAt", "desc"),
          firestoreLimit(10)
        )
      );

      articlesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category && !suggestions.includes(data.category)) {
          suggestions.push(data.category);
        }
        if (data.tags) {
          data.tags.forEach((tag: string) => {
            if (!suggestions.includes(tag)) {
              suggestions.push(tag);
            }
          });
        }
      });

      // Get popular authors
      const authorsQuery = collection(db, "user-profiles");
      const authorsSnapshot = await getDocs(
        firestoreQuery(
          authorsQuery,
          where("role", "in", ["author", "editor", "admin"]),
          orderBy("stats.totalArticles", "desc"),
          firestoreLimit(5)
        )
      );

      authorsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && !suggestions.includes(data.name)) {
          suggestions.push(data.name);
        }
      });

      // Filter suggestions based on query
      const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );

      return filteredSuggestions.slice(0, limit);

    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  },

  // Track search query for analytics
  trackSearchQuery: async (
    query: string,
    userId: string | undefined,
    resultsCount: number,
    clickedResult?: string,
    filters?: Record<string, unknown>
  ): Promise<void> => {
    try {
      await addDoc(collection(db, "search-queries"), {
        query,
        userId,
        timestamp: serverTimestamp(),
        resultsCount,
        clickedResult,
        filters,
      });
    } catch (error) {
      console.error("Error tracking search query:", error);
    }
  },

  // Check if content matches search term
  matchesSearch(content: Article | Video | Research | LegalArticle, searchTerm: string): boolean {
    const searchableFields = [
      content.title?.toLowerCase(),
      // Handle optional properties safely
      'excerpt' in content ? content.excerpt?.toLowerCase() : undefined,
      'description' in content ? content.description?.toLowerCase() : undefined,
      'abstract' in content ? content.abstract?.toLowerCase() : undefined,
      'category' in content ? content.category?.toLowerCase() : undefined,
      'department' in content ? content.department?.toLowerCase() : undefined,
      content.authorName?.toLowerCase(),
      ...(content.tags || []).map((tag: string) => tag.toLowerCase()),
    ].filter(Boolean);

    return searchableFields.some(field => field && field.includes(searchTerm));
  },

  // Sort results by relevance
  sortByRelevance(results: Array<{
    id: string;
    type: 'article' | 'video' | 'research' | 'legal';
    title: string;
    excerpt?: string;
    description?: string;
    abstract?: string;
    category: string;
    publishedAt: Date;
    authorName: string;
    coverImage?: string;
    thumbnailUrl?: string;
    views?: number;
    likes: number;
    department?: string;
  }>, searchTerm: string): Array<{
    id: string;
    type: 'article' | 'video' | 'research' | 'legal';
    title: string;
    excerpt?: string;
    description?: string;
    abstract?: string;
    category: string;
    publishedAt: Date;
    authorName: string;
    coverImage?: string;
    thumbnailUrl?: string;
    views?: number;
    likes: number;
    department?: string;
  }> {
    return results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);

      // Exact title matches first
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      // Then by date (newer first)
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  },
};

// Enhanced Content Service with likes
export const EnhancedContentService = {
  // Like/unlike content
  toggleLike: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    userId: string
  ): Promise<void> => {
    try {
      const collectionName = contentType === 'legal' ? 'legal-articles' : `${contentType}s`;
      const contentRef = doc(db, collectionName, contentId);
      
      // Get current content
      const contentDoc = await getDoc(contentRef);
      if (!contentDoc.exists()) throw new Error("Content not found");

      const content = contentDoc.data();
      const likedBy = content.likedBy || [];
      const isLiked = likedBy.includes(userId);

      await updateDoc(contentRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });

      // Update analytics
      // Assuming AnalyticsService is defined elsewhere or will be added
      // await AnalyticsService.updateContentAnalytics(contentId, contentType, isLiked ? 'unlike' : 'like');
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },

  // Check if user has liked content
  hasLiked: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    userId: string
  ): Promise<boolean> => {
    try {
      const collectionName = contentType === 'legal' ? 'legal-articles' : `${contentType}s`;
      const contentRef = doc(db, collectionName, contentId);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) return false;

      const content = contentDoc.data();
      const likedBy = content.likedBy || [];
      return likedBy.includes(userId);
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  },

  // Get content with like status
  getContentWithLikeStatus: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    userId?: string
  ): Promise<{
    content: Article | Video | Research | LegalArticle | null;
    hasLiked: boolean;
  }> => {
    try {
      let content: Article | Video | Research | LegalArticle | null = null;
      let hasLiked = false;

      switch (contentType) {
        case 'article':
          content = await ArticleService.getArticle(contentId);
          break;
        case 'video':
          content = await VideoService.getVideo(contentId);
          break;
        case 'research':
          content = await ResearchService.getResearchArticle(contentId);
          break;
        case 'legal':
          content = await LegalService.getLegalArticle(contentId);
          break;
      }

      if (content && userId) {
        hasLiked = await EnhancedContentService.hasLiked(contentId, contentType, userId);
      }

      return { content, hasLiked };
    } catch (error) {
      console.error("Error getting content with like status:", error);
      return { content: null, hasLiked: false };
    }
  },
};

// News Ticker Service for Breaking News
export const NewsTickerService = {
  // Get all active news tickers
  getActiveTickers: async (): Promise<NewsTicker[]> => {
    try {
      const tickersQuery = collection(db, "newsTickers");
      const q = firestoreQuery(
        tickersQuery,
        where("isActive", "==", true),
        orderBy("priority", "desc"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const tickers: NewsTicker[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tickers.push({
          ...data,
          id: doc.id,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
          expiresAt: data.expiresAt ? convertTimestampToDate(data.expiresAt) : undefined,
        } as NewsTicker);
      });
      
      return tickers;
    } catch (error) {
      console.error("Error fetching news tickers:", error);
      return [];
    }
  },

  // Get all news tickers for admin
  getAllTickers: async (): Promise<NewsTicker[]> => {
    try {
      const tickersQuery = collection(db, "newsTickers");
      const q = firestoreQuery(tickersQuery, orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const tickers: NewsTicker[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tickers.push({
          ...data,
          id: doc.id,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
          expiresAt: data.expiresAt ? convertTimestampToDate(data.expiresAt) : undefined,
        } as NewsTicker);
      });
      
      return tickers;
    } catch (error) {
      console.error("Error fetching all news tickers:", error);
      return [];
    }
  },

  // Create a new news ticker
  createTicker: async (ticker: Omit<NewsTicker, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "newsTickers"), {
        ...ticker,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating news ticker:", error);
      throw error;
    }
  },

  // Update a news ticker
  updateTicker: async (id: string, ticker: Partial<NewsTicker>): Promise<void> => {
    try {
      const docRef = doc(db, "newsTickers", id);
      
      // Filter out undefined values
      const cleanTicker = Object.fromEntries(
        Object.entries(ticker).filter(([, value]) => value !== undefined)
      );
      
      await updateDoc(docRef, {
        ...cleanTicker,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating news ticker:", error);
      throw error;
    }
  },

  // Delete a news ticker
  deleteTicker: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, "newsTickers", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting news ticker:", error);
      throw error;
    }
  },

  // Toggle ticker active status
  toggleTickerStatus: async (id: string, isActive: boolean): Promise<void> => {
    try {
      const docRef = doc(db, "newsTickers", id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error toggling ticker status:", error);
      throw error;
    }
  },
};

// Sport Banner Service
export const SportBannerService = {
  // Get current active banner
  getActiveBanner: async (): Promise<SportBanner | null> => {
    try {
      const bannersRef = collection(db, "sport-banners");
      const q = firestoreQuery(
        bannersRef,
        where("isEnabled", "==", true),
        orderBy("date", "desc"),
        firestoreLimit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as SportBanner;
      }
      return null;
    } catch (error) {
      console.error("Error getting active banner:", error);
      throw error;
    }
  },

  // Get all banners
  getAllBanners: async (): Promise<SportBanner[]> => {
    try {
      const bannersRef = collection(db, "sport-banners");
      const q = firestoreQuery(bannersRef, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SportBanner[];
    } catch (error) {
      console.error("Error getting all banners:", error);
      throw error;
    }
  },

  // Create new banner
  createBanner: async (bannerData: Omit<SportBanner, 'id' | 'lastUpdated' | 'createdBy' | 'updatedBy'>): Promise<string> => {
    try {
      const bannersRef = collection(db, "sport-banners");
      const newBanner = {
        ...bannerData,
        lastUpdated: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'admin',
        updatedBy: auth.currentUser?.uid || 'admin',
      };
      const docRef = await addDoc(bannersRef, newBanner);
      return docRef.id;
    } catch (error) {
      console.error("Error creating banner:", error);
      throw error;
    }
  },

  // Update banner
  updateBanner: async (bannerId: string, updates: Partial<SportBanner>): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      await updateDoc(bannerRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      throw error;
    }
  },

  // Delete banner
  deleteBanner: async (bannerId: string): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      await deleteDoc(bannerRef);
    } catch (error) {
      console.error("Error deleting banner:", error);
      throw error;
    }
  },

  // Enable/disable banner
  toggleBanner: async (bannerId: string, isEnabled: boolean): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      await updateDoc(bannerRef, {
        isEnabled,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      });
    } catch (error) {
      console.error("Error toggling banner:", error);
      throw error;
    }
  },

  // Update game score
  updateScore: async (bannerId: string, homeScore: number, awayScore: number): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      await updateDoc(bannerRef, {
        homeScore,
        awayScore,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      });
    } catch (error) {
      console.error("Error updating score:", error);
      throw error;
    }
  },

  // Add substitution
  addSubstitution: async (bannerId: string, substitution: Omit<Substitution, 'id'>): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      const bannerDoc = await getDoc(bannerRef);
      const banner = bannerDoc.data() as SportBanner;
      
      const newSubstitution: Substitution = {
        id: crypto.randomUUID(),
        ...substitution,
      };
      
      const updatedSubstitutions = [...(banner.substitutions || []), newSubstitution];
      
      await updateDoc(bannerRef, {
        substitutions: updatedSubstitutions,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      });
    } catch (error) {
      console.error("Error adding substitution:", error);
      throw error;
    }
  },

  // Add highlight
  addHighlight: async (bannerId: string, highlight: Omit<GameHighlight, 'id'>): Promise<void> => {
    try {
      const bannerRef = doc(db, "sport-banners", bannerId);
      const bannerDoc = await getDoc(bannerRef);
      const banner = bannerDoc.data() as SportBanner;
      
      const newHighlight: GameHighlight = {
        id: crypto.randomUUID(),
        ...highlight,
      };
      
      const updatedHighlights = [...(banner.highlights || []), newHighlight];
      
      await updateDoc(bannerRef, {
        highlights: updatedHighlights,
        lastUpdated: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      });
    } catch (error) {
      console.error("Error adding highlight:", error);
      throw error;
    }
  },

  // Get banner settings
  getBannerSettings: async (): Promise<SportBannerSettings> => {
    try {
      const settingsRef = doc(db, "sport-banner-settings", "default");
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as SportBannerSettings;
      }
      
      // Return default settings if none exist
      return {
        id: "default",
        isEnabled: false,
        autoRefresh: true,
        refreshInterval: 30,
        showSubstitutions: true,
        showHighlights: true,
        bannerStyle: 'detailed',
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error getting banner settings:", error);
      throw error;
    }
  },

  // Update banner settings
  updateBannerSettings: async (settings: Partial<SportBannerSettings>): Promise<void> => {
    try {
      const settingsRef = doc(db, "sport-banner-settings", "default");
      await setDoc(settingsRef, {
        ...settings,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating banner settings:", error);
      throw error;
    }
  },
};

// Test export to verify module resolution
export const TEST_EXPORT = {
  test: () => "Firebase service is working",
  services: {
    ArticleService: typeof ArticleService,
    VideoService: typeof VideoService,
    ResearchService: typeof ResearchService,
    LegalService: typeof LegalService,
    UserService: typeof UserService,
    SettingsService: typeof SettingsService,
    CommentService: typeof CommentService,
    NewsTickerService: typeof NewsTickerService,
    UserProfileService: typeof UserProfileService,
    EnhancedSearchService: typeof EnhancedSearchService,
    EnhancedContentService: typeof EnhancedContentService,
    SportBannerService: typeof SportBannerService,
  }
};
