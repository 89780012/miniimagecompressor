import { useLocale } from 'next-intl'
import { generateWebsiteSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface StructuredDataProps {
  pageType?: 'compression' | 'resize'
  breadcrumbs?: Array<{name: string, url: string}>
}

export function StructuredData({ pageType = 'compression', breadcrumbs }: StructuredDataProps) {
  const locale = useLocale()

  const websiteSchema = generateWebsiteSchema(locale, pageType)
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
      )}
    </>
  )
}