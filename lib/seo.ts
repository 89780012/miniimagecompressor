import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export interface SEOPageProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  locale?: string
}

export async function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  locale = 'zh'
}: SEOPageProps): Promise<Metadata> {
  const t = await getTranslations()
  
  const defaultKeywords = [
    'image compression',
    'photo compressor', 
    'reduce image size',
    'optimize images',
    '图片压缩',
    '照片压缩',
    '图片优化',
    '在线压缩'
  ]

  const siteTitle = t('common.title')
  const siteDescription = t('common.subtitle')
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const fullDescription = description || siteDescription
  const allKeywords = [...defaultKeywords, ...keywords]

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://imagecompressor.com'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const imageUrl = image ? `${baseUrl}${image}` : `${baseUrl}/og-image.jpg`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords.join(', '),
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteTitle,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [imageUrl],
    },
    
    // Additional Meta Tags
    robots: 'index, follow',
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-CN': locale === 'zh' ? fullUrl : fullUrl.replace('/en', ''),
        'en-US': locale === 'en' ? fullUrl : `${fullUrl}/en`,
      },
    },
    
    // Verification tags (add your own)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION,
      other: process.env.BAIDU_SITE_VERIFICATION ? {
        'baidu-site-verification': process.env.BAIDU_SITE_VERIFICATION,
      } : {},
    },
    
    // Additional metadata
    authors: [{ name: 'Image Compressor Team', url: baseUrl }],
    creator: 'Image Compressor',
    publisher: 'Image Compressor',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}

// Schema.org JSON-LD structured data
export function generateWebsiteSchema(locale: string = 'zh') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://imagecompressor.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: locale === 'zh' ? '图片压缩工具' : 'Image Compressor',
    description: locale === 'zh' 
      ? '免费在线图片压缩工具，支持JPEG、PNG、WebP格式，保持图片质量的同时减小文件大小'
      : 'Free online image compression tool. Reduce image file size while maintaining quality. Support JPEG, PNG, WebP formats.',
    url: baseUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'Image Compressor Team',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization', 
      name: 'Image Compressor',
      url: baseUrl
    }
  }
}

export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://imagecompressor.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  }
}