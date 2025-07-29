import { doc, getDoc, setDoc, deleteDoc, Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface SurveyResult<T = Record<string, unknown>> {
  id: string;
  testType: string;
  userId: string;
  answers: Record<string, unknown>[];
  results: T;
  timeStarted: Date;
  timeCompleted: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliticalCoordinatesResult {
  economicScore: number;
  socialScore: number;
  quadrant: string;
  description: string;
  recommendations: string[];
}

export class SurveyService {
  private static getCollectionName(testType: string): string {
    return `survey_results_${testType}`;
  }

  private static getDocumentId(userId: string, testType: string): string {
    return `${userId}_${testType}`;
  }

  static async saveSurveyResult<T = Record<string, unknown>>(
    userId: string,
    testType: string,
    answers: Record<string, unknown>[],
    results: T,
    timeStarted: Date,
    timeCompleted: Date
  ): Promise<void> {
    try {
      const docId = this.getDocumentId(userId, testType);
      const collectionName = this.getCollectionName(testType);
      
      const surveyResult: SurveyResult<T> = {
        id: docId,
        testType,
        userId,
        answers,
        results,
        timeStarted,
        timeCompleted,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, collectionName, docId), surveyResult);
    } catch (error) {
      console.error("Error saving survey result:", error);
      throw new Error("Failed to save survey result");
    }
  }

  static async getSurveyResult<T = Record<string, unknown>>(
    userId: string,
    testType: string
  ): Promise<SurveyResult<T> | null> {
    try {
      const docId = this.getDocumentId(userId, testType);
      const collectionName = this.getCollectionName(testType);
      
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
              const data = docSnap.data() as SurveyResult & {
        timeStarted: Timestamp | Date;
        timeCompleted: Timestamp | Date;
        createdAt: Timestamp | Date;
        updatedAt: Timestamp | Date;
      };
      // Convert Firestore timestamps back to Date objects
      return {
        ...data,
        timeStarted: data.timeStarted instanceof Timestamp ? data.timeStarted.toDate() : new Date(data.timeStarted),
        timeCompleted: data.timeCompleted instanceof Timestamp ? data.timeCompleted.toDate() : new Date(data.timeCompleted),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as SurveyResult<T>;
      }

      return null;
    } catch (error) {
      console.error("Error getting survey result:", error);
      throw new Error("Failed to get survey result");
    }
  }

  static async deleteSurveyResult(
    userId: string,
    testType: string
  ): Promise<void> {
    try {
      const docId = this.getDocumentId(userId, testType);
      const collectionName = this.getCollectionName(testType);
      
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error("Error deleting survey result:", error);
      throw new Error("Failed to delete survey result");
    }
  }

  static async hasCompletedSurvey(
    userId: string,
    testType: string
  ): Promise<boolean> {
    try {
      const result = await this.getSurveyResult(userId, testType);
      return result !== null;
    } catch (error) {
      console.error("Error checking survey completion:", error);
      return false;
    }
  }

  static async getTestStatistics(testType: string): Promise<Record<string, unknown>> {
    try {
      const collectionName = this.getCollectionName(testType);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        return {
          totalParticipants: 0,
          averageEconomicScore: 0,
          averageSocialScore: 0,
          quadrantDistribution: {
            "Authoritarian Left": 0,
            "Authoritarian Right": 0,
            "Libertarian Left": 0,
            "Libertarian Right": 0,
            "Centrist": 0
          },
          scoreRanges: {
            economic: { left: 0, center: 0, right: 0 },
            social: { authoritarian: 0, center: 0, libertarian: 0 }
          }
        };
      }

      const results = snapshot.docs.map((doc) => doc.data().results as Record<string, unknown>);
      const totalParticipants = results.length;

      // Calculate averages for political coordinates
      if (testType === TEST_TYPES.POLITICAL_COORDINATES) {
        const economicScores = results.map((r) => (r as { economicScore: number }).economicScore);
        const socialScores = results.map((r) => (r as { socialScore: number }).socialScore);
        const quadrants = results.map((r) => (r as { quadrant: string }).quadrant);

        const averageEconomicScore = Math.round(economicScores.reduce((a: number, b: number) => a + b, 0) / totalParticipants);
        const averageSocialScore = Math.round(socialScores.reduce((a: number, b: number) => a + b, 0) / totalParticipants);

        // Count quadrants
        const quadrantDistribution = {
          "Authoritarian Left": quadrants.filter(q => q === "Authoritarian Left").length,
          "Authoritarian Right": quadrants.filter(q => q === "Authoritarian Right").length,
          "Libertarian Left": quadrants.filter(q => q === "Libertarian Left").length,
          "Libertarian Right": quadrants.filter(q => q === "Libertarian Right").length,
          "Centrist": quadrants.filter(q => q === "Centrist").length
        };

        // Count score ranges
        const scoreRanges = {
          economic: {
            left: economicScores.filter(s => s < -20).length,
            center: economicScores.filter(s => s >= -20 && s <= 20).length,
            right: economicScores.filter(s => s > 20).length
          },
          social: {
            authoritarian: socialScores.filter(s => s > 20).length,
            center: socialScores.filter(s => s >= -20 && s <= 20).length,
            libertarian: socialScores.filter(s => s < -20).length
          }
        };

        return {
          totalParticipants,
          averageEconomicScore,
          averageSocialScore,
          quadrantDistribution,
          scoreRanges
        };
      }

      return { totalParticipants };
    } catch (error) {
      console.error("Error getting test statistics:", error);
      return {
        totalParticipants: 0,
        averageEconomicScore: 0,
        averageSocialScore: 0,
        quadrantDistribution: {},
        scoreRanges: {}
      };
    }
  }
}

// Test type constants
export const TEST_TYPES = {
  POLITICAL_COORDINATES: 'political_coordinates',
  IQ_TEST: 'iq_test',
  EMPATHY_TEST: 'empathy_test',
  LEADERSHIP_TEST: 'leadership_test',
  MEMORY_TEST: 'memory_test',
  POLITICAL_COORDINATES_LEFT_RIGHT: 'political_coordinates_left_right',
  DARK_TRIAD: 'dark_triad',
  VILLAIN_TEST: 'villain_test',
  PHONE_GERMS: 'phone_germs',
  MONEY_PERSONALITY: 'money_personality',
  ORGANIZATION_TEST: 'organization_test',
  LEARNING_STYLE: 'learning_style',
} as const;

export type TestType = typeof TEST_TYPES[keyof typeof TEST_TYPES]; 