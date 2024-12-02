export const GET_USER = {
  id: true,
  image: true,
  fullName: true,
  username: true,
  bio: true,
  link: true,
  createdAt: true,
  isAdmin: true,
  followers: {
    select: {
      id: true,
      image: true,
    },
  },
};

export const GET_COUNT = {
  _count: {
    select: {
      likes: true,
      reposts: true,
      bookmarks: true,
    },
  },
};

export const GET_REPOSTS = {
  reposts: {
    select: {
      postId: true,
      userId: true,
    },
  },
};

export const GET_LIKES = {
  likes: {
    select: {
      userId: true,
    },
  },
};

export const GET_BOOKMARKS = {
  bookmarks: {
    select: {
      userId: true,
    },
  },
};

export const GET_REPLIES = {
  replies: {
    select: {
      id: true,
      text: true,
      createdAt: true,
      media: true,
      parentPostId: true,
      quoteId: true,
      path: true,
      repliesCount: true,
      author: {
        select: {
          ...GET_USER,
        },
      },
      ...GET_LIKES,
      ...GET_REPOSTS,
    },
  },
};

export const GET_MENTIONS = {
  mentions: {
    select: {
      index: true,
      user: {
        select: {
          ...GET_USER,
        },
      },
    },
  },
};

export const GET_LINK_PREVIEW = {
  linkPreview: {
    select: {
      url: true,
      title: true,
      description: true,
      image: true,
    },
  },
};
