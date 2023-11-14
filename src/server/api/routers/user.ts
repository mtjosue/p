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
        firstLoad: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.firstLoad) return null;
      if (!input.userId) return null;
      const userFound = await ctx.db.user.findUnique({
        where: { userId: input.userId },
        select: {
          userId: true,
          termsAgreed: true,
          skips: true,
          status: true,
        },
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
        skips: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.skips) {
        return await ctx.db.user.update({
          where: { userId: input.userId },
          data: {
            status: input.status,
            skips: {
              decrement: 1,
            },
          },
        });
      } else {
        return await ctx.db.user.update({
          where: { userId: input.userId },
          data: {
            status: input.status,
          },
        });
      }
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
          status: "waiting",
        },
      });
      await ctx.db.user.update({
        where: { userId: firstMatch.userId },
        data: {
          status: "waiting",
        },
      });

      const match = await ctx.db.match.create({
        data: {
          localUserId: input.userId,
          remoteUserId: firstMatch.userId,
          tempPeerId: input.tempId,
        },
      });

      return match;
    }),
  getMatch: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        created: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.created) return null;
      const match = await ctx.db.match.findFirst({
        where: {
          remoteUserId: input.userId,
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
          remoteUserId: true,
          localUserId: true,
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
        userId: z.string(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.status) {
        await ctx.db.user.update({
          where: { userId: input.userId },
          data: {
            status: input.status,
          },
        });
      }
      return await ctx.db.match.update({
        where: { id: input.matchid },
        data: {
          status: "ended",
        },
      });
    }),
  refresh: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.userId) return null;
      return await ctx.db.user.update({
        where: {
          userId: input.userId,
        },
        data: {
          skips: { decrement: 1 },
          status: "waiting",
        },
      });
    }),
});
