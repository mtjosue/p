import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { RtcRole, RtcTokenBuilder } from "agora-token";
// import { env } from "~/env.mjs";

// const appId = env.NEXT_PUBLIC_AGORA_APP_ID;
// const appCertificate = env.NEXT_PUBLIC_AGORA_APP_CERT;

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
    .input(
      z.object({
        name: z.string().min(1),
        userId: z.string(),
        termsAgreed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.user.create({
        data: {
          name: input.name,
          userId: input.userId,
          termsAgreed: true,
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
      if (!input.userId) {
        console.log("NO USERID INPUT!");
        return null;
      }

      const firstMatch = await ctx.db.user.findFirst({
        where: {
          status: "looking",
          NOT: {
            userId: input.userId || "",
          },
        },
      });

      if (!firstMatch) return null;

      const match = await ctx.db.match.create({
        data: {
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
          status: { not: "ended" },
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

        select: {
          tempPeerId: true,
          sinkUserId: true,
          sourceUserId: true,
          // sourceUser: true,
          // sinkUserId: true,
        },
      });
      return match;
    }),
  endMatch: publicProcedure
    .input(
      z.object({
        matchid: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.match.update({
        where: { id: input.matchid },
        data: {
          status: "ended",
        },
      });
    }),
  searchMatchOrCreate: publicProcedure
    .input(
      z.object({
        tempId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.userId) {
        console.log("NO USERID INPUT!");
        return null;
      }
      if (!input.tempId) {
        console.log("NO PEERID INPUT!");
        return null;
      }

      const firstMatch = await ctx.db.user.findFirst({
        where: {
          status: "looking",
          NOT: {
            userId: input.userId || "",
          },
        },
      });

      if (!firstMatch) return null;

      await ctx.db.user.update({
        where: { userId: input.userId },
        data: {
          status: "chatting",
        },
      });
      await ctx.db.user.update({
        where: { userId: firstMatch.userId },
        data: {
          status: "chatting",
        },
      });

      const match = await ctx.db.match.create({
        data: {
          sourceUserId: input.userId,
          sinkUserId: firstMatch.userId,
          tempPeerId: input.tempId,
        },
      });

      return match;
    }),
});
