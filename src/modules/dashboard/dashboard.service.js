import { db } from '../../db/knex.js';

const count = (table, where = {}) =>
  db(table)
    .where(where)
    .count({ total: '*' })
    .first()
    .then(({ total }) => Number(total));

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
    count('posts'),
    count('posts', { status: 'published' }),
    count('events'),
    count('staff'),
    count('gallery_items'),
    count('messages', { isRead: false }),
    db('posts').orderBy('createdAt', 'desc').limit(5).select('id', 'title', 'status', 'createdAt'),
    db('messages')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .select('id', 'name', 'subject', 'isRead', 'createdAt'),
  ]);

  return {
    stats: { posts, publishedPosts, events, staff, gallery, unreadMessages },
    recentPosts,
    recentMessages,
  };
}
