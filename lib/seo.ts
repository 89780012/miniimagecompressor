import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export interface SEOPageProps {
  title: string
  description: string
  keywords: string
  image?: string
  url?: string
  locale?: string
}

export async function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  url,
  locale = 'en'
}: SEOPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale })
  

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mycompressor.org'
  
  // 多语言URL构建逻辑 - en不带前缀，其他语言带前缀
  let localePrefix = ''
  if (locale !== 'en') {
    localePrefix = `/${locale}`
  }
  
  const fullUrl = url ? `${baseUrl}${localePrefix}${url}` : `${baseUrl}${localePrefix}`
  const imageUrl = image ? `${baseUrl}${image}` : `${baseUrl}/og-image.jpg`

  // 根据语言设置正确的locale
  let ogLocale = 'en_US'
  if (locale === 'zh') {
    ogLocale = 'zh_CN'
  } else if (locale === 'hi') {
    ogLocale = 'hi_IN'
  }

  return {
    title: title,
    description: description,
    keywords: keywords,
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: fullUrl,
      title: title,
      description: description,
      siteName: title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
    
    // Additional Meta Tags
    robots: 'index, follow',
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': locale === 'en' ? fullUrl : baseUrl + (url || ''),
        'zh-CN': locale === 'zh' ? fullUrl : baseUrl + '/zh' + (url || ''),
        'hi-IN': locale === 'hi' ? fullUrl : baseUrl + '/hi' + (url || ''),
        'x-default': baseUrl + (url || '')
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
    authors: [{ name: t('common.title') + ' Team', url: baseUrl }],
    creator: t('common.title'),
    publisher: t('common.title'),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}

// Schema.org JSON-LD structured data
export function generateWebsiteSchema(locale: string = 'en', pageType: 'compression' | 'resize' = 'compression') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mycompressor.org'

  // 根据页面类型生成不同的schema
  let name, description

  if (pageType === 'resize') {
    name = locale === 'zh' ? '图片尺寸调整工具' : locale === 'hi' ? 'इमेज रीसाइज़ टूल' : 'Image Resize Tool'
    description = locale === 'zh'
      ? '免费在线图片尺寸调整工具，支持自定义尺寸、预设比例和图片裁剪。保持图片质量的同时调整尺寸。'
      : locale === 'hi'
      ? 'मुफ्त ऑनलाइन इमेज रीसाइज़ टूल। कस्टम डाइमेंशन, प्रीसेट अनुपात और क्रॉपिंग सुविधाओं के साथ इमेज का साइज़ बदलें। गुणवत्ता बनाए रखते हुए साइज़ एडजस्ट करें।'
      : 'Free online image resizing tool. Resize images with custom dimensions, preset ratios, and cropping features. Maintain quality while adjusting size.'
  } else {
    name = locale === 'zh' ? '图片压缩工具' : locale === 'hi' ? 'इमेज कम्प्रेसर' : 'Image Compressor'
    description = locale === 'zh'
      ? '免费在线图片压缩工具，支持JPEG、PNG、WebP格式，保持图片质量的同时减小文件大小'
      : locale === 'hi'
      ? 'मुफ्त ऑनलाइन इमेज संपीड़न टूल। गुणवत्ता बनाए रखते हुए फ़ाइल का आकार कम करें। JPEG, PNG, WebP प्रारूप समर्थित'
      : 'Free online image compression tool. Reduce image file size while maintaining quality. Support JPEG, PNG, WebP formats.'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: name,
    description: description,
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
      name: pageType === 'resize' ? 'Image Resize Tool' : 'Image Compressor',
      url: baseUrl
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Alex Chen'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody: pageType === 'resize'
          ? (locale === 'zh'
            ? '图片尺寸调整功能很棒，支持多种比例和裁剪，非常实用！'
            : locale === 'hi'
            ? 'इमेज रीसाइज़ फीचर बहुत बेहतरीन है, अलग-अलग अनुपात और क्रॉपिंग सपोर्ट करता है!'
            : 'Excellent image resizing feature, supports various ratios and cropping options!')
          : (locale === 'zh'
            ? '非常好用的图片压缩工具，速度快，质量保持得很好！'
            : locale === 'hi'
            ? 'बहुत बेहतरीन इमेज कम्प्रेशन टूल, तेज़ और गुणवत्ता बनी रहती है!'
            : 'Excellent image compression tool, fast and maintains great quality!'),
        datePublished: '2025-09-11'
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody: pageType === 'resize'
          ? (locale === 'zh'
            ? '尺寸调整工具界面简洁，操作简单，效果很好。'
            : locale === 'hi'
            ? 'रीसाइज़ टूल का इंटरफ़ेस सरल और उपयोग में आसान है।'
            : 'Resize tool has a clean interface and is easy to use.')
          : (locale === 'zh'
            ? '批量处理功能很棒，节省了大量时间。界面简洁易用。'
            : locale === 'hi'
            ? 'बैच प्रोसेसिंग फीचर बहुत अच्छा है, बहुत समय बचाता है। इंटरफ़ेस आसान है।'
            : 'Batch processing feature is amazing, saves so much time. Clean and easy interface.'),
        datePublished: '2025-09-11'
      }
    ]
  }
}

export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mycompressor.org'
  
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