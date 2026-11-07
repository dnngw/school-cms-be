/**
 * Every section type the page builder supports.
 * The frontend has a matching renderer + editor for each type.
 * To add a new section type: add it here, then register it in the frontend registry.
 */
export const SECTION_TYPES = [
  'hero', // Big banner with headline & buttons
  'stats', // Numbers: students, teachers, achievements...
  'about', // Short profile with image
  'principal', // Principal's welcome message (sambutan kepala sekolah)
  'programs', // Featured programs / majors (program unggulan / jurusan)
  'news', // Latest posts (dynamic)
  'events', // Upcoming events / agenda (dynamic)
  'staff', // Teachers & staff (dynamic)
  'gallery', // Photo gallery (dynamic)
  'testimonials', // Alumni / parents testimonials
  'achievements', // Awards (prestasi)
  'faq', // Frequently asked questions
  'cta', // Call to action, e.g. new student admission (PPDB)
  'contact', // Contact info, map and form
  'partners', // Partner logos
  'video', // Embedded YouTube video
  'richtext', // Free HTML content
];
