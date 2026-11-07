import { z } from 'zod';
import { SETTINGS_KEYS } from './settings.defaults.js';

const hexColor = z
  .string()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i, 'Must be a hex color');
const optionalText = (max = 500) => z.string().trim().max(max).optional();
// Uploaded media are stored as relative paths ("/uploads/x.png"), external ones as full URLs.
const urlOrPath = z.string().trim().max(500).optional();

const schemas = {
  general: z.object({
    siteName: z.string().trim().min(1).max(120),
    tagline: optionalText(200),
    logo: urlOrPath,
    favicon: urlOrPath,
    npsn: optionalText(20),
    accreditation: optionalText(10),
    foundedYear: optionalText(4),
    principalName: optionalText(120),
  }),
  contact: z.object({
    address: optionalText(),
    phone: optionalText(40),
    email: z.union([z.email(), z.literal('')]).optional(),
    whatsapp: optionalText(40),
    openingHours: optionalText(120),
    mapEmbedUrl: urlOrPath,
  }),
  social: z.object({
    facebook: urlOrPath,
    instagram: urlOrPath,
    youtube: urlOrPath,
    tiktok: urlOrPath,
    x: urlOrPath,
  }),
  seo: z.object({
    metaTitle: optionalText(120),
    metaDescription: optionalText(300),
    metaKeywords: optionalText(300),
    ogImage: urlOrPath,
  }),
  announcement: z.object({
    enabled: z.boolean(),
    text: optionalText(200),
    link: urlOrPath,
  }),
  footer: z.object({
    about: optionalText(1000),
    copyright: optionalText(200),
  }),
  theme: z.object({
    colors: z.object({
      primary: hexColor,
      primaryForeground: hexColor,
      secondary: hexColor,
      secondaryForeground: hexColor,
      accent: hexColor,
      background: hexColor,
      foreground: hexColor,
      surface: hexColor,
      muted: hexColor,
      border: hexColor,
      headerBackground: hexColor,
      headerForeground: hexColor,
      footerBackground: hexColor,
      footerForeground: hexColor,
    }),
    typography: z.object({
      headingFont: z.string().trim().min(1).max(60),
      bodyFont: z.string().trim().min(1).max(60),
      baseFontSize: z.number().int().min(12).max(22),
    }),
    radius: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
    buttonStyle: z.enum(['square', 'rounded', 'pill']),
    headerStyle: z.enum(['static', 'sticky']),
    containerWidth: z.number().int().min(960).max(1600),
    animation: z.enum(['none', 'subtle', 'lively']),
  }),
};

export const settingsKeyParams = z.object({ key: z.enum(SETTINGS_KEYS) });

/** Returns the Zod schema used to validate the value of a settings group. */
export const getSettingsSchema = (key) => schemas[key];
