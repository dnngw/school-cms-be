import { z } from 'zod';
import { paginationQuery } from '../../utils/pagination.js';

export const createMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().max(30).nullish(),
  subject: z.string().trim().max(200).nullish(),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: real users never see/fill this field, bots usually do.
  website: z.string().max(0, 'Spam detected').optional(),
});

export const messagesQuery = paginationQuery.extend({
  isRead: z.stringbool().optional(),
});

export const updateMessageSchema = z.object({ isRead: z.boolean() });
