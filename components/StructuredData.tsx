import { useLocale } from 'next-intl'
import { generateWebsiteSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface StructuredDataProps {
  breadcrumbs?: Array<{name: string, url: string}>
}

export function StructuredData({ breadcrumbs }: StructuredDataProps) {
  const locale = useLocale()
  
  const websiteSchema = generateWebsiteSchema(locale)
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs, locale) : null

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