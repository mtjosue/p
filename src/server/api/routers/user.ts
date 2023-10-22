import { equal } from "assert";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  userCheck: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      const userFound = ctx.db.user.findUnique({
        where: { userId: input.userId },
      });
      return userFound;
    }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.user.create({
        data: {
          name: input.name,
          userId: input.userId,
        },
      });
    }),
  statusUpdate: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { userId: input.userId },
        data: {
          status: input.status,
        },
      });
    }),
  searchMatch: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const firstMatch = await ctx.db.user.findFirst({
        where: {
          status: "looking",
          NOT: {
            userId: input.userId,
          },
        },
      });

      console.log("firstMatch", firstMatch);
      if (!firstMatch) return null;

      const match = await ctx.db.match.create({
        data: {
          // id: input.userId + firstMatch.userId,
          sourceUserId: input.userId,
          sinkUserId: firstMatch.userId,
        },
      });
      return match;
    }),
  getMatch: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findFirst({
        where: {
          sinkUserId: input.userId,
        },
      });

      return match;
    }),
  getMatchForPage: publicProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({
        where: {
          id: input.matchId,
        },
        include: {
          sinkUser: true,
          sourceUser: true,
        },
      });
      return match;
    }),
});
