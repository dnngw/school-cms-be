import { prisma } from '../../db/prisma.js';
import { uniqueSlug } from '../../utils/slug.js';

/** All categories with the number of published posts in each. */
export async function list() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: { where: { status: 'published' } } } } },
  });
  return categories.map(({ _count, ...category }) => ({ ...category, postCount: _count.posts }));
}

export async function create({ name, slug, description }) {
  return prisma.category.create({
    data: { name, description, slug: await uniqueSlug(prisma.category, slug || name) },
  });
}

export async function update(id, { name, slug, description }) {
  return prisma.category.update({
    where: { id },
    data: { name, description, slug: await uniqueSlug(prisma.category, slug || name, id) },
  });
}

export async function remove(id) {
  await prisma.category.delete({ where: { id } });
}
