/**
 * Default values for every settings group.
 * The app works out of the box even when the `settings` table is empty,
 * stored values are deep-merged on top of these defaults.
 */
export const SETTINGS_DEFAULTS = {
  general: {
    siteName: 'Sekolah Nusantara',
    tagline: 'Cerdas, Berkarakter, dan Berprestasi',
    logo: '',
    favicon: '',
    npsn: '',
    accreditation: 'A',
    foundedYear: '',
    principalName: '',
  },
  contact: {
    address: 'Jl. Pendidikan No. 1, Jakarta',
    phone: '(021) 123456',
    email: 'info@sekolah.sch.id',
    whatsapp: '',
    openingHours: 'Senin - Jumat, 07.00 - 15.00',
    mapEmbedUrl: '',
  },
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    x: '',
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
  },
  announcement: {
    enabled: false,
    text: '',
    link: '',
  },
  footer: {
    about: '',
    copyright: '',
  },
  theme: {
    colors: {
      primary: '#1d4ed8',
      primaryForeground: '#ffffff',
      secondary: '#f59e0b',
      secondaryForeground: '#1f2937',
      accent: '#10b981',
      background: '#ffffff',
      foreground: '#0f172a',
      surface: '#f8fafc',
      muted: '#64748b',
      border: '#e2e8f0',
      headerBackground: '#ffffff',
      headerForeground: '#0f172a',
      footerBackground: '#0f172a',
      footerForeground: '#e2e8f0',
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      baseFontSize: 16,
    },
    radius: 'md',
    buttonStyle: 'rounded',
    headerStyle: 'sticky',
    containerWidth: 1200,
    // Scroll / entrance animations on the website: none | subtle | lively
    animation: 'subtle',
  },
};

export const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS);
