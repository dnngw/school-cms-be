import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../../config/logger.js';
import { prisma } from '../../db/prisma.js';
import { uploadDir } from '../../middlewares/upload.js';
import { contains, paginate } from '../../utils/pagination.js';

const TYPE_FILTERS = {
  image: { mimetype: { startsWith: 'image/' } },
  document: { NOT: { mimetype: { startsWith: 'image/' } } },
};

export function list({ page, limit, search, type }) {
  const where = {
    ...(search ? { originalName: contains(search) } : {}),
    ...(TYPE_FILTERS[type] ?? {}),
  };
  return paginate(prisma.media, { where, orderBy: { createdAt: 'desc' } }, { page, limit });
}

/** Save metadata of a file that multer already wrote to disk. */
export function create(file, userId) {
  return prisma.media.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy: userId,
    },
  });
}

export const update = (id, data) => prisma.media.update({ where: { id }, data });

export async function remove(id) {
  const media = await prisma.media.delete({ where: { id }, select: { filename: true } });

  // path.basename prevents path traversal even if the DB value was tampered with.
  await fs.rm(path.join(uploadDir, path.basename(media.filename)), { force: true }).catch((err) => {
    logger.warn({ err }, 'Failed to delete media file from disk');
  });
}
