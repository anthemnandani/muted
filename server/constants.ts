import { Privacy } from '@prisma/client';

export const GET_USER = {
  id: true,
  image: true,
  fullName: true,
  username: true,
  bio: true,
  link: true,
  createdAt: true,
  privacy: true,
  isAdmin: true,
  followers: {
    select: {
      followerId: true,
    },
  },
  following: {
    select: {
      followingId: true,
    },
  },
};

export const GET_COUNT = {
  _count: {
    select: {
      likes: true,
      reposts: true,
      replies: true,
    },
  },
};

export const GET_REPOSTS = {
  select: {
    postId: true,
    user: {
      select: {
        ...GET_USER,
        followers: {
          select: {
            followerId: true,
          },
        },
        blockedUsers: {
          select: {
            blockedUserId: true,
          },
        },
        blockedByUsers: {
          select: {
            blockingUserId: true,
          },
        },
      },
    },
    createdAt: true,
  },
};

export const getLikesWithBlockFilter = (userId: string) => ({
  likes: {
    where: {
      user: {
        blockedByUsers: {
          none: {
            blockingUserId: userId,
          },
        },
        blockedUsers: {
          none: {
            blockedUserId: userId,
          },
        },
      },
    },
    select: {
      userId: true,
    },
  },
});

export const getBookmarksWithBlockFilter = (userId: string) => ({
  bookmarks: {
    where: {
      user: {
        blockedByUsers: {
          none: {
            blockingUserId: userId,
          },
        },
        blockedUsers: {
          none: {
            blockedUserId: userId,
          },
        },
      },
    },
    select: {
      userId: true,
      collection: {
        select: {
          isDefault: true,
        },
      },
    },
  },
});

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

export const getAuthorAndHiddenSelect = (userId: string) => ({
  author: {
    select: {
      ...GET_USER,
      mutedByUsers: {
        where: {
          mutedByUserId: userId,
        },
        select: {
          mutedByUserId: true,
        },
      },
    },
  },
  hiddenBy: {
    where: {
      userId,
    },
    select: {
      userId: true,
    },
  },
});

export const getCommentRepliesCount = (userId: string) => ({
  _count: {
    select: {
      replies: {
        where: {
          author: {
            blockedByUsers: {
              none: {
                blockingUserId: userId,
              },
            },
            blockedUsers: {
              none: {
                blockedUserId: userId,
              },
            },
          },
        },
      },
    },
  },
});

export const getPostRepliesCount = (userId: string) => ({
  _count: {
    select: {
      replies: {
        where: {
          author: {
            blockedByUsers: {
              none: {
                blockingUserId: userId,
              },
            },
            blockedUsers: {
              none: {
                blockedUserId: userId,
              },
            },
          },
        },
      },
    },
  },
  replies: {
    where: {
      author: {
        blockedByUsers: {
          none: {
            blockingUserId: userId,
          },
        },
        blockedUsers: {
          none: {
            blockedUserId: userId,
          },
        },
      },
    },
    select: {
      id: true,
      _count: {
        select: {
          replies: {
            where: {
              author: {
                blockedByUsers: {
                  none: {
                    blockingUserId: userId,
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: userId,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export const getPrivacyFilter = (userId: string | null) => {
  if (!userId) {
    return {
      author: {
        privacy: Privacy.PUBLIC,
      },
    };
  }

  return {
    OR: [
      {
        author: {
          privacy: Privacy.PUBLIC,
        },
      },
      {
        author: {
          id: userId,
        },
      },
      {
        author: {
          followers: {
            some: {
              followerId: userId,
            },
          },
        },
      },
    ],
  };
};
