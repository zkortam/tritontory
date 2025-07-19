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
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Article, Video, Research, LegalArticle, User, Comment, Settings, NewsTicker } from "./models";

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

      const q = query(articlesQuery, ...queryConstraints);
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
      const q = query(articlesQuery, orderBy("updatedAt", "desc"));
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

      const q = query(videosQuery, ...queryConstraints);
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
      const q = query(videosQuery, orderBy("updatedAt", "desc"));
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

      const q = query(researchQuery, ...queryConstraints);
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
      const q = query(researchQuery, orderBy("updatedAt", "desc"));
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

      const q = query(legalQuery, ...queryConstraints);
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
      const q = query(legalQuery, orderBy("updatedAt", "desc"));
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
  getUsers: async (): Promise<User[]> => {
    const usersQuery = collection(db, "users");
    const querySnapshot = await getDocs(usersQuery);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        id: doc.id,
        joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(),
      } as User);
    });
    return users;
  },

  // Create a new user in Firestore
  createUser: async (user: Omit<User, "id" | "joinedAt">): Promise<string> => {
    const docRef = await addDoc(collection(db, "users"), {
      ...user,
      joinedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update an existing user in Firestore
  updateUser: async (id: string, user: Partial<User>): Promise<void> => {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, user);
  },

  // Delete a user from Firestore
  deleteUser: async (id: string): Promise<void> => {
    const docRef = doc(db, "users", id);
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

// Comment Service for User Engagement
export const CommentService = {
  // Get comments for a specific content item
  getComments: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    status: 'pending' | 'approved' | 'rejected' = 'approved',
    limit: number = 50
  ): Promise<Comment[]> => {
    try {
      const commentsQuery = collection(db, "comments");
      const q = query(
        commentsQuery,
        where("contentId", "==", contentId),
        where("contentType", "==", contentType),
        where("status", "==", status)
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
      
      // Sort in memory instead of using orderBy in query
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply limit in memory
      return comments.slice(0, limit);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
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
      
      const q = query(commentsQuery, ...queryConstraints);
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
      
      // Sort in memory instead of using orderBy in query
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return comments;
    } catch (error) {
      console.error("Error fetching all comments:", error);
      return [];
    }
  },

  // Create a new comment
  createComment: async (
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    content: string,
    authorId: string,
    authorName: string
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        contentId,
        contentType,
        content,
        authorId,
        authorName,
        status: 'approved', // Auto-approve comments
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update comment status (moderation)
  updateCommentStatus: async (commentId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      const docRef = doc(db, "comments", commentId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating comment status:", error);
      throw error;
    }
  },

  // Update comment content
  updateComment: async (commentId: string, content: string): Promise<void> => {
    try {
      const docRef = doc(db, "comments", commentId);
      await updateDoc(docRef, {
        content,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    try {
      const docRef = doc(db, "comments", commentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get comment statistics for content
  getCommentStats: async (contentId: string, contentType: 'article' | 'video' | 'research' | 'legal'): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }> => {
    try {
      const commentsQuery = collection(db, "comments");
      const q = query(
        commentsQuery,
        where("contentId", "==", contentId),
        where("contentType", "==", contentType)
      );
      
      const querySnapshot = await getDocs(q);
      const stats = {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        if (data.status === 'approved') stats.approved++;
        else if (data.status === 'pending') stats.pending++;
        else if (data.status === 'rejected') stats.rejected++;
      });
      
      return stats;
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      return { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
  },
};

// News Ticker Service for Breaking News
export const NewsTickerService = {
  // Get all active news tickers
  getActiveTickers: async (): Promise<NewsTicker[]> => {
    try {
      const tickersQuery = collection(db, "newsTickers");
      const q = query(
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
      const q = query(tickersQuery, orderBy("createdAt", "desc"));
      
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
  }
};
