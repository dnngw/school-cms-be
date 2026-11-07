import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../../db/knex.js';
import { logger } from '../../config/logger.js';
import { uploadDir } from '../../middlewares/upload.js';
import { ApiError } from '../../utils/api-error.js';
import { paginate } from '../../utils/pagination.js';

export function list({ page, limit, search, type }) {
  const query = db('media').orderBy('createdAt', 'desc');
  if (search) query.whereILike('originalName', `%${search}%`);
  if (type === 'image') query.whereLike('mimetype', 'image/%');
  if (type === 'document') query.whereNotLike('mimetype', 'image/%');
  return paginate(query, { page, limit });
}

/** Save metadata of a file that multer already wrote to disk. */
export async function create(file, userId) {
  const [row] = await db('media')
    .insert({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy: userId,
    })
    .returning('*');
  return row;
}

export async function update(id, data) {
  const [row] = await db('media').where({ id }).update(data).returning('*');
  if (!row) throw ApiError.notFound('Media not found');
  return row;
}

export async function remove(id) {
  const [row] = await db('media').where({ id }).delete().returning('filename');
  if (!row) throw ApiError.notFound('Media not found');

  // path.basename prevents path traversal even if the DB value was tampered with.
  await fs.rm(path.join(uploadDir, path.basename(row.filename)), { force: true }).catch((err) => {
    logger.warn({ err }, 'Failed to delete media file from disk');
  });
}
