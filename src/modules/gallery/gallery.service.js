import { prisma } from '../../db/prisma.js';
import { contains, paginate } from '../../utils/pagination.js';

const orderBy = [{ sortOrder: 'asc' }, { id: 'desc' }];

const filters = ({ album, search }) => ({
  ...(album ? { album } : {}),
  ...(search ? { title: contains(search) } : {}),
});

export const listVisible = (query) =>
  paginate(prisma.galleryItem, { where: { ...filters(query), isVisible: true }, orderBy }, query);

export const list = (query) =>
  paginate(prisma.galleryItem, { where: filters(query), orderBy }, query);

/** Distinct album names with item counts — used for filter tabs on the website. */
export async function listAlbums() {
  const groups = await prisma.galleryItem.groupBy({
    by: ['album'],
    where: { isVisible: true, album: { not: null } },
    _count: { _all: true },
    orderBy: { album: 'asc' },
  });
  return groups.map((group) => ({ name: group.album, total: group._count._all }));
}

export const create = (data) => prisma.galleryItem.create({ data });

export const update = (id, data) => prisma.galleryItem.update({ where: { id }, data });

export async function remove(id) {
  await prisma.galleryItem.delete({ where: { id } });
}
