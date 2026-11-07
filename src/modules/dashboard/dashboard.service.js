import { prisma } from '../../db/prisma.js';

/** Summary numbers + recent activity for the admin dashboard. */
export async function getSummary() {
  const [
    posts,
    publishedPosts,
    events,
    staff,
    gallery,
    unreadMessages,
    recentPosts,
    recentMessages,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.event.count(),
    prisma.staff.count(),
    prisma.galleryItem.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, subject: true, isRead: true, createdAt: true },
    }),
  ]);

  return {
    stats: { posts, publishedPosts, events, staff, gallery, unreadMessages },
    recentPosts,
    recentMessages,
  };
}
