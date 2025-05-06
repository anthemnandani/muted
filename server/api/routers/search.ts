// server/routers/searchRouter.ts
import { createTRPCRouter, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
// import { stopwords } from '@/lib/stopwords'; // Common words to filter out

export const searchRouter = createTRPCRouter({
  getSearchSuggestions: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      const { userId } = ctx;

      if (!query.trim()) {
        return {
          suggestions: [],
          accounts: [],
        };
      }

      const normalizedQuery = query.trim().toLowerCase();

      // 1. GET USER CONTEXT - Get user's recent interactions for personalization
      const userContext = await getUserContext(ctx, userId);

      // 2. EXTRACT N-GRAMS FROM POSTS
      // Get all n-grams (1-4 word phrases) from posts that start with or contain the query
      const phraseSuggestions = await getNGramSuggestions(
        ctx,
        normalizedQuery,
        limit
      );

      // 3. GET SEMANTIC MATCHES - Find content with similar meaning
      const semanticSuggestions = await getSemanticSuggestions(
        ctx,
        normalizedQuery,
        limit
      );

      // 4. GET TRENDING RELATED TERMS
      const trendingSuggestions = await getTrendingSuggestions(
        ctx,
        normalizedQuery,
        limit
      );

      // 5. GET PERSONALIZED HISTORY - What this user and similar users have searched for
      const personalizedSuggestions = await getPersonalizedSuggestions(
        ctx,
        userId,
        normalizedQuery,
        limit
      );

      // 6. ACCOUNTS TO FOLLOW
      const accountSuggestions = await getAccountSuggestions(
        ctx,
        userId,
        normalizedQuery
      );

      // 7. COMBINE AND RANK SUGGESTIONS
      const combinedSuggestions = rankAndDeduplicate(
        [
          ...personalizedSuggestions.map((s) => ({
            ...s,
            score: s.score * 1.5, // Boost personalized suggestions
            type: 'personalized',
          })),
          ...trendingSuggestions.map((s) => ({
            ...s,
            score: s.score * 1.3, // Boost trending suggestions
            type: 'trending',
          })),
          ...phraseSuggestions.map((s) => ({
            ...s,
            type: 'phrase',
          })),
          ...semanticSuggestions.map((s) => ({
            ...s,
            type: 'semantic',
          })),
        ],
        limit
      );

      return {
        suggestions: combinedSuggestions,
        accounts: accountSuggestions,
      };
    }),

  recordSearch: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
        resultClicked: z.boolean().optional(),
        resultType: z
          .enum(['post', 'user', 'hashtag', 'suggestion'])
          .optional(),
        resultId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { query, resultClicked, resultType, resultId } = input;
      const { userId } = ctx;

      if (!query.trim()) {
        return { success: false };
      }

      const normalizedQuery = query.trim().toLowerCase();

      // Record the search along with click-through data and user info
      try {
        // Store the search query
        const searchEntry = await ctx.db.searchQuery.upsert({
          where: {
            query: normalizedQuery,
          },
          update: {
            count: { increment: 1 },
            updatedAt: new Date(),
          },
          create: {
            query: normalizedQuery,
            count: 1,
          },
        });

        // Store user search interaction for personalization
        if (userId) {
          await ctx.db.$executeRaw`
            INSERT INTO "UserSearchHistory" ("userId", "searchQueryId", "resultClicked", "resultType", "resultId", "createdAt")
            VALUES (${userId}, ${searchEntry.id}, ${resultClicked || false}, ${
            resultType || null
          }, ${resultId || null}, NOW())
          `;
        }

        return { success: true };
      } catch (error) {
        console.error('Error recording search:', error);
        return { success: false, error: 'Failed to record search' };
      }
    }),
});

// Helper functions

async function getUserContext(ctx, userId: string) {
  if (!userId) return { interests: [], follows: [], recentSearches: [] };

  // Get user's followed accounts
  const follows = await ctx.db.user.findUnique({
    where: { id: userId },
    select: {
      following: {
        select: { id: true },
      },
    },
  });

  // Get hashtags from posts user has interacted with
  const interactedHashtags = await ctx.db.$queryRaw`
    SELECT DISTINCT h.name
    FROM "Hashtag" h
    JOIN "_PostHashtags" ph ON ph."B" = h.id
    JOIN "Post" p ON p.id = ph."A"
    WHERE p.id IN (
      SELECT "postId" FROM "Like" WHERE "userId" = ${userId}
      UNION
      SELECT "postId" FROM "Bookmark" WHERE "userId" = ${userId}
      UNION
      SELECT "postId" FROM "Repost" WHERE "userId" = ${userId}
    )
    LIMIT 20
  `;

  // Get user's recent searches
  const recentSearches = await ctx.db.$queryRaw`
    SELECT sq.query
    FROM "UserSearchHistory" ush
    JOIN "SearchQuery" sq ON ush."searchQueryId" = sq.id
    WHERE ush."userId" = ${userId}
    ORDER BY ush."createdAt" DESC
    LIMIT 10
  `;

  return {
    interests: interactedHashtags.map((h) => h.name),
    follows: follows.following.map((f) => f.id),
    recentSearches: recentSearches.map((rs) => rs.query),
  };
}

async function getNGramSuggestions(ctx, query, limit) {
  // Extract n-grams (1-4 word phrases) from posts
  // This uses a more advanced SQL function that properly breaks text into words
  const ngramResults = await ctx.db.$queryRaw`
    WITH 
    words AS (
      SELECT id, regexp_split_to_table(LOWER(text), '\\s+') as word
      FROM "Post"
      WHERE text IS NOT NULL
    ),
    ngrams AS (
      SELECT
        p.id,
        string_agg(w.word, ' ' ORDER BY idx) as phrase,
        COUNT(*) OVER (PARTITION BY string_agg(w.word, ' ' ORDER BY idx)) as frequency
      FROM "Post" p
      JOIN LATERAL (
        SELECT word, generate_subscripts(regexp_split_to_array(LOWER(p.text), '\\s+'), 1) as idx
        FROM words
        WHERE words.id = p.id
      ) w ON true
      WHERE 
        position(${query} in LOWER(p.text)) > 0 AND
        w.idx BETWEEN 1 AND (
          SELECT MIN(i + 3) 
          FROM generate_subscripts(regexp_split_to_array(LOWER(p.text), '\\s+'), 1) i
          WHERE position(${query} in regexp_split_to_array(LOWER(p.text), '\\s+')[i]) > 0
        )
      GROUP BY p.id, w.idx
      HAVING position(${query} in string_agg(w.word, ' ' ORDER BY idx)) = 1
    )
    SELECT DISTINCT phrase, frequency as score
    FROM ngrams
    WHERE 
      length(phrase) > 3 AND
      phrase !~ '^(the|and|or|but|if|because|when|what|how|who|where|why|is|are|was|were|am|this|that|these|those)\\s'
    ORDER BY frequency DESC
    LIMIT ${limit}
  `;

  return ngramResults;
}

async function getSemanticSuggestions(ctx, query, limit) {
  // For semantic matches, we would typically use vector embeddings
  // This is a simplified version using text similarity
  // In a real implementation, use embeddings from a model like sentence-transformers

  // Simplified implementation: find words that commonly appear together with the query terms
  const relatedTerms = await ctx.db.$queryRaw`
    WITH 
    query_tokens AS (
      SELECT regexp_split_to_table(${query}, '\\s+') as token
    ),
    post_tokens AS (
      SELECT 
        id,
        regexp_split_to_table(LOWER(text), '\\s+') as token
      FROM "Post"
      WHERE text IS NOT NULL
    ),
    matching_posts AS (
      SELECT DISTINCT pt.id
      FROM post_tokens pt
      JOIN query_tokens qt ON position(qt.token in pt.token) > 0
    ),
    co_occurring_tokens AS (
      SELECT 
        pt.token,
        COUNT(*) as frequency
      FROM post_tokens pt
      JOIN matching_posts mp ON pt.id = mp.id
      WHERE pt.token NOT IN (SELECT token FROM query_tokens)
        AND length(pt.token) > 3
      GROUP BY pt.token
      ORDER BY frequency DESC
      LIMIT 30
    )
    SELECT 
      tok.token as phrase,
      tok.frequency as score
    FROM co_occurring_tokens tok
    LIMIT ${limit}
  `;

  return relatedTerms;
}

async function getTrendingSuggestions(ctx, query, limit) {
  // Find trending searches related to query (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const trendingTerms = await ctx.db.$queryRaw`
    SELECT 
      sq.query as phrase,
      COUNT(ush.id) as recent_searches,
      sq.count as total_searches,
      CASE 
        WHEN sq.count = 0 THEN 0
        ELSE (COUNT(ush.id)::float / sq.count) * 100
      END as recency_score,
      (COUNT(ush.id) * 0.7 + sq.count * 0.3) as score
    FROM "SearchQuery" sq
    LEFT JOIN "UserSearchHistory" ush ON ush."searchQueryId" = sq.id AND ush."createdAt" > ${oneWeekAgo}
    WHERE 
      position(${query} in sq.query) = 1 OR
      EXISTS (
        SELECT 1 FROM regexp_split_to_table(${query}, '\\s+') qt
        WHERE position(qt in sq.query) > 0
      )
    GROUP BY sq.id, sq.query, sq.count
    HAVING COUNT(ush.id) > 1
    ORDER BY recency_score DESC, score DESC
    LIMIT ${limit}
  `;

  return trendingTerms;
}

async function getPersonalizedSuggestions(ctx, userId, query, limit) {
  if (!userId) return [];

  // Find what similar users have searched for
  const userInterests = await getUserContext(ctx, userId);

  // Find users with similar interests
  const similarUsers = await ctx.db.$queryRaw`
    WITH user_hashtags AS (
      SELECT 
        l."userId",
        h.name as hashtag
      FROM "Like" l
      JOIN "Post" p ON l."postId" = p.id
      JOIN "_PostHashtags" ph ON ph."A" = p.id
      JOIN "Hashtag" h ON h.id = ph."B"
      WHERE l."userId" = ${userId}
      
      UNION
      
      SELECT 
        b."userId",
        h.name as hashtag
      FROM "Bookmark" b
      JOIN "Post" p ON b."postId" = p.id
      JOIN "_PostHashtags" ph ON ph."A" = p.id
      JOIN "Hashtag" h ON h.id = ph."B"
      WHERE b."userId" = ${userId}
    ),
    similar_users AS (
      SELECT 
        l."userId",
        COUNT(DISTINCT h.name) as shared_hashtags
      FROM "Like" l
      JOIN "Post" p ON l."postId" = p.id
      JOIN "_PostHashtags" ph ON ph."A" = p.id
      JOIN "Hashtag" h ON h.id = ph."B"
      WHERE h.name IN (SELECT hashtag FROM user_hashtags)
        AND l."userId" != ${userId}
      GROUP BY l."userId"
      HAVING COUNT(DISTINCT h.name) > 2
      ORDER BY shared_hashtags DESC
      LIMIT 100
    )
    SELECT 
      sq.query as phrase,
      COUNT(ush.id) as frequency,
      COUNT(ush.id) * 2 as score
    FROM "UserSearchHistory" ush
    JOIN "SearchQuery" sq ON ush."searchQueryId" = sq.id
    WHERE ush."userId" IN (SELECT "userId" FROM similar_users)
      AND position(${query} in sq.query) = 1
    GROUP BY sq.query
    ORDER BY frequency DESC
    LIMIT ${limit}
  `;

  return similarUsers;
}

async function getAccountSuggestions(ctx, userId, query) {
  // Find relevant user accounts
  const accounts = await ctx.db.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
      ],
      // Filter out blocked/muted users
      AND: userId
        ? [
            {
              blockedByUsers: { none: { blockingUserId: userId } },
              blockedUsers: { none: { blockedUserId: userId } },
              mutedByUsers: { none: { mutedByUserId: userId } },
            },
          ]
        : undefined,
    },
    orderBy: [
      {
        followers: { _count: 'desc' }, // Popular accounts first
      },
      { verified: 'desc' }, // Verified accounts first
      { createdAt: 'desc' }, // Then newer accounts
    ],
    take: 4,
    select: {
      id: true,
      username: true,
      fullName: true,
      image: true,
      verified: true,
      _count: {
        select: {
          followers: true,
          posts: true,
        },
      },
    },
  });

  return accounts;
}

function rankAndDeduplicate(suggestions, limit) {
  // Deduplicate and rank by score
  const uniqueMap = new Map();

  suggestions.forEach((item) => {
    const normalizedText = item.phrase.toLowerCase();
    if (
      !uniqueMap.has(normalizedText) ||
      uniqueMap.get(normalizedText).score < item.score
    ) {
      uniqueMap.set(normalizedText, item);
    }
  });

  // Sort by score (descending)
  const result = Array.from(uniqueMap.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      text: item.phrase,
      type: item.type,
      score: item.score,
    }))
    .slice(0, limit);

  return result;
}
