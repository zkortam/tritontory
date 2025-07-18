import { Metadata } from "next";
import { Article, Video, Research, LegalArticle } from "./models";

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url: string;
  type: 'website' | 'article' | 'video' | 'research' | 'legal';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export class SEOService {
  // Generate metadata for the home page
  static getHomeMetadata(): Metadata {
    return {
      title: "Triton Tory Media - UC San Diego's Premier Student Media",
      description: "The comprehensive voice of UC San Diego featuring news, videos, research, and legal analysis. Stay informed with campus updates, sports coverage, and academic insights.",
      keywords: [
        "UCSD", "UC San Diego", "student media", "campus news", "triton", 
        "university news", "student journalism", "campus life", "academic research"
      ],
      openGraph: {
        title: "Triton Tory Media - UC San Diego's Premier Student Media",
        description: "The comprehensive voice of UC San Diego featuring news, videos, research, and legal analysis.",
        url: "https://tritontory.com",
        siteName: "Triton Tory Media",
        images: [
          {
            url: "https://tritontory.com/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "Triton Tory Media - UC San Diego's Premier Student Media",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Triton Tory Media - UC San Diego's Premier Student Media",
        description: "The comprehensive voice of UC San Diego featuring news, videos, research, and legal analysis.",
        images: ["https://tritontory.com/og-image.jpg"],
        creator: "@tritontory",
        site: "@tritontory",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      verification: {
        google: "your-google-verification-code",
        yandex: "your-yandex-verification-code",
        yahoo: "your-yahoo-verification-code",
      },
    };
  }

  // Generate metadata for articles
  static getArticleMetadata(article: Article, url: string): Metadata {
    const seoConfig: SEOConfig = {
      title: `${article.title} | Triton Tory Media`,
      description: article.excerpt || `Read the latest news about ${article.title} from UC San Diego's premier student media outlet.`,
      keywords: [
        ...article.tags,
        article.category,
        article.section,
        "UCSD", "UC San Diego", "campus news", "student media"
      ],
      image: article.coverImage,
      url,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      author: article.authorName,
      section: article.section,
      tags: article.tags,
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate metadata for videos
  static getVideoMetadata(video: Video, url: string): Metadata {
    const seoConfig: SEOConfig = {
      title: `${video.title} | Triton Today`,
      description: video.description || `Watch ${video.title} from UC San Diego's video news platform.`,
      keywords: [
        ...video.tags,
        video.category,
        "UCSD", "UC San Diego", "campus videos", "student media", "video news"
      ],
      image: video.thumbnailUrl,
      url,
      type: "video",
      publishedTime: video.publishedAt.toISOString(),
      modifiedTime: video.updatedAt.toISOString(),
      author: video.authorName,
      tags: video.tags,
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate metadata for research articles
  static getResearchMetadata(research: Research, url: string): Metadata {
    const seoConfig: SEOConfig = {
      title: `${research.title} | Science Journal`,
      description: research.abstract || `Explore groundbreaking research: ${research.title} from UC San Diego's Science Journal.`,
      keywords: [
        ...research.tags,
        research.department,
        "UCSD", "UC San Diego", "research", "science", "academic research"
      ],
      image: research.coverImage,
      url,
      type: "article",
      publishedTime: research.publishedAt.toISOString(),
      modifiedTime: research.updatedAt.toISOString(),
      author: research.authorName,
      section: research.department,
      tags: research.tags,
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate metadata for legal articles
  static getLegalMetadata(legal: LegalArticle, url: string): Metadata {
    const seoConfig: SEOConfig = {
      title: `${legal.title} | Law Review`,
      description: legal.abstract || `Legal analysis: ${legal.title} from UC San Diego's Law Review.`,
      keywords: [
        ...legal.tags,
        legal.category,
        "UCSD", "UC San Diego", "legal analysis", "law review", "legal research"
      ],
      image: legal.coverImage,
      url,
      type: "article",
      publishedTime: legal.publishedAt.toISOString(),
      modifiedTime: legal.updatedAt.toISOString(),
      author: legal.authorName,
      section: legal.category,
      tags: legal.tags,
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate metadata for section pages
  static getSectionMetadata(section: string, description: string, url: string): Metadata {
    const sectionTitles = {
      'triton-tory': 'Triton Tory News',
      'triton-today': 'Triton Today Videos',
      'triton-science': 'Science Journal',
      'triton-law': 'Law Review',
    };

    const seoConfig: SEOConfig = {
      title: `${sectionTitles[section as keyof typeof sectionTitles] || section} | Triton Tory Media`,
      description,
      keywords: [
        section,
        "UCSD", "UC San Diego", "student media", "campus news"
      ],
      url,
      type: "website",
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate metadata for static pages
  static getStaticPageMetadata(page: string, title: string, description: string, url: string): Metadata {
    const seoConfig: SEOConfig = {
      title: `${title} | Triton Tory Media`,
      description,
      keywords: [
        page,
        "UCSD", "UC San Diego", "student media", "about", "contact"
      ],
      url,
      type: "website",
    };

    return this.generateMetadata(seoConfig);
  }

  // Generate structured data (JSON-LD)
  static generateStructuredData(seoConfig: SEOConfig, content?: Record<string, unknown>) {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": seoConfig.type === "article" ? "Article" : "WebPage",
      "headline": seoConfig.title,
      "description": seoConfig.description,
      "image": seoConfig.image,
      "url": seoConfig.url,
      "publisher": {
        "@type": "Organization",
        "name": "Triton Tory Media",
        "url": "https://tritontory.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tritontory.com/logo.png",
          "width": 512,
          "height": 512,
        },
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": seoConfig.url,
      },
    };

    if (seoConfig.type === "article" && content) {
      return {
        ...baseStructuredData,
        "@type": "Article",
        "author": {
          "@type": "Person",
          "name": seoConfig.author,
        },
        "datePublished": seoConfig.publishedTime,
        "dateModified": seoConfig.modifiedTime,
        "articleSection": seoConfig.section,
        "keywords": seoConfig.keywords?.join(", "),
        "wordCount": content.content ? (content.content as string).split(" ").length : undefined,
        "timeRequired": content.content ? 
          `PT${Math.ceil((content.content as string).split(" ").length / 200)}M` : undefined,
      };
    }

    if (seoConfig.type === "video" && content) {
      return {
        ...baseStructuredData,
        "@type": "VideoObject",
        "name": seoConfig.title,
        "description": seoConfig.description,
        "thumbnailUrl": seoConfig.image,
        "uploadDate": seoConfig.publishedTime,
        "duration": content.duration ? `PT${Math.floor((content.duration as number) / 60)}M${(content.duration as number) % 60}S` : undefined,
        "author": {
          "@type": "Person",
          "name": seoConfig.author,
        },
      };
    }

    return baseStructuredData;
  }

  // Generate sitemap data
  static generateSitemapData(content: Array<{ id: string; updatedAt: Date; type: string }>) {
    const baseUrl = "https://tritontory.com";
    const sitemapEntries = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/triton-tory`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/triton-today`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/triton-science`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/triton-law`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
    ];

    // Add content pages
    content.forEach((item) => {
      const typePath = {
        article: "triton-tory",
        video: "triton-today",
        research: "triton-science",
        legal: "triton-law",
      }[item.type];

      if (typePath) {
        sitemapEntries.push({
          url: `${baseUrl}/${typePath}/${item.id}`,
          lastModified: item.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    });

    return sitemapEntries;
  }

  // Private method to generate metadata
  private static generateMetadata(seoConfig: SEOConfig): Metadata {
    return {
      title: seoConfig.title,
      description: seoConfig.description,
      keywords: seoConfig.keywords,
      openGraph: {
        title: seoConfig.title,
        description: seoConfig.description,
        url: seoConfig.url,
        siteName: "Triton Tory Media",
        images: seoConfig.image ? [
          {
            url: seoConfig.image,
            width: 1200,
            height: 630,
            alt: seoConfig.title,
          },
        ] : [
          {
            url: "https://tritontory.com/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "Triton Tory Media",
          },
        ],
        locale: "en_US",
        type: seoConfig.type === 'video' || seoConfig.type === 'research' || seoConfig.type === 'legal' ? 'website' : seoConfig.type,
        publishedTime: seoConfig.publishedTime,
        modifiedTime: seoConfig.modifiedTime,
        authors: seoConfig.author ? [seoConfig.author] : undefined,
        section: seoConfig.section,
        tags: seoConfig.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: seoConfig.title,
        description: seoConfig.description,
        images: seoConfig.image ? [seoConfig.image] : ["https://tritontory.com/og-image.jpg"],
        creator: "@tritontory",
        site: "@tritontory",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: seoConfig.url,
      },
      other: {
        ...(seoConfig.publishedTime && { "article:published_time": seoConfig.publishedTime }),
        ...(seoConfig.modifiedTime && { "article:modified_time": seoConfig.modifiedTime }),
        ...(seoConfig.author && { "article:author": seoConfig.author }),
        ...(seoConfig.section && { "article:section": seoConfig.section }),
        ...(seoConfig.tags && { "article:tag": seoConfig.tags.join(", ") }),
      },
    };
  }
} 