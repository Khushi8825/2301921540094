const CacheKeys = {
  userNotifications: (userId, page, limit) =>
    `notifications:user:${userId}:page:${page}:limit:${limit}`,

  userUnread: (userId, page, limit) =>
    `notifications:unread:${userId}:page:${page}:limit:${limit}`,

  userCount: (userId) =>
    `notifications:count:${userId}`,

  prioritized: (userId) =>
    `notifications:prioritized:${userId}`,

  userPattern: (userId) =>
    `notifications:*:${userId}:*`,

  countPattern: (userId) =>
    `notifications:count:${userId}`,
};

export { CacheKeys };