import { MetadataRoute } from 'next'

const base = 'https://operonauto.com'

const industryRoutes = [
  'home-services',
  'med-spas',
  'auto-shops',
  'fitness-studios',
  'dental-offices',
  'clinics',
  'cleaning-companies',
  'contractors',
  'real-estate',
  'local-services',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                          priority: 1.0,  changeFrequency: 'weekly'  },
    { url: `${base}/scanner`,             priority: 0.95, changeFrequency: 'monthly' },
    { url: `${base}/revenue-autopilot`,   priority: 0.9,  changeFrequency: 'monthly' },
    { url: `${base}/pricing`,             priority: 0.85, changeFrequency: 'monthly' },
    { url: `${base}/services`,            priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${base}/how-it-works`,        priority: 0.75, changeFrequency: 'monthly' },
    { url: `${base}/industries`,          priority: 0.75, changeFrequency: 'monthly' },
    { url: `${base}/about`,               priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${base}/contact`,             priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${base}/privacy`,             priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${base}/terms`,               priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${base}/sms-terms`,           priority: 0.3,  changeFrequency: 'yearly'  },
  ]

  const industryPages: MetadataRoute.Sitemap = industryRoutes.map((slug) => ({
    url: `${base}/scanner/${slug}`,
    priority: 0.65,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticPages, ...industryPages]
}
