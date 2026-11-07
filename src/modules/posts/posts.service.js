import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { contains, paginate } from '../../utils/pagination.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';

/** Load the category and author together with the post (SQL JOIN). */
const include = {
  category: { select: { name: true, slug: true } },
  author: { select: { name: true } },
};

/** Flatten relations so the API keeps a simple shape: { categoryName, categorySlug, authorName }. */
const toDto = ({ category, author, ...post }) => ({
  ...post,
  categoryName: category?.name ?? null,
  categorySlug: category?.slug ?? null,
  authorName: author?.name ?? null,
});

const searchFilter = (search) =>
  search ? { OR: [{ title: contains(search) }, { excerpt: contains(search) }] } : {};

/** Published = status "published" and publish date already passed (supports scheduling). */
const publishedFilter = () => ({ status: 'published', publishedAt: { lte: new Date() } });

/** Create a plain text excerpt from HTML when the author didn't write one. */
const makeExcerpt = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

async function toData(input, id) {
  const content = sanitizeRichText(input.content);
  return {
    title: input.title,
    slug: await uniqueSlug(prisma.post, input.slug || input.title, id),
    excerpt: input.excerpt || makeExcerpt(content),
    content,
    coverImage: input.coverImage,
    categoryId: input.categoryId ?? null,
    status: input.status,
    isFeatured: input.isFeatured,
    // Publishing without a date means "publish now".
    publishedAt:
      input.status === 'published'
        ? (input.publishedAt ?? new Date())
        : (input.publishedAt ?? null),
  };
}

// --- Public ---------------------------------------------------------------

export async function listPublished({ page, limit, search, category, featured }) {
  const where = {
    ...publishedFilter(),
    ...searchFilter(search),
    ...(category ? { category: { slug: category } } : {}),
    ...(featured !== undefined ? { isFeatured: featured } : {}),
  };
  const result = await paginate(
    prisma.post,
    // Lists don't need the full article body -> omit it.
    { where, include, omit: { content: true }, orderBy: { publishedAt: 'desc' } },
    { page, limit },
  );
  return { ...result, data: result.data.map(toDto) };
}

export async function findPublishedBySlug(slug) {
  const post = await prisma.post.findFirst({ where: { slug, ...publishedFilter() }, include });
  if (!post) throw ApiError.notFound('Post not found');

  // Atomic increment (no race condition between concurrent visitors).
  const { views } = await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
    select: { views: true },
  });
  return toDto({ ...post, views });
}

// --- Admin ----------------------------------------------------------------

export async function list({ page, limit, search, status, categoryId }) {
  const where = {
    ...searchFilter(search),
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
  const result = await paginate(
    prisma.post,
    { where, include, omit: { content: true }, orderBy: { createdAt: 'desc' } },
    { page, limit },
  );
  return { ...result, data: result.data.map(toDto) };
}

export async function findById(id) {
  const post = await prisma.post.findUnique({ where: { id }, include });
  if (!post) throw ApiError.notFound('Post not found');
  return toDto(post);
}

export async function create(input, authorId) {
  const post = await prisma.post.create({ data: { ...(await toData(input)), authorId }, include });
  return toDto(post);
}

export async function update(id, input) {
  const post = await prisma.post.update({ where: { id }, data: await toData(input, id), include });
  return toDto(post);
}

export async function remove(id) {
  await prisma.post.delete({ where: { id } });
}
