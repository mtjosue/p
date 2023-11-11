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
  getMatch: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findFirst({
        where: {
          remoteUserId: input.userId,
          status: { not: "ended" },
          skipped: { not: true },
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
        count: z.number(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //
      const match = await ctx.db.match.findFirst({
        where: {
          id: input.matchid,
        },
        select: {
          skipped: true,
        },
      });
      //
      if (!match?.skipped) {
        if (input.count > 0) {
          await ctx.db.user.update({
            where: { userId: input.userId },
            data: {
              skips: {
                decrement: 1,
              },
              status: input.status,
            },
          });
          await ctx.db.match.update({
            where: {
              id: input.matchid,
            },
            data: {
              skipped: true,
            },
          });
        } else {
          await ctx.db.user.update({
            where: { userId: input.userId },
            data: {
              status: input.status,
            },
          });
          await ctx.db.match.update({
            where: {
              id: input.matchid,
            },
            data: {
              skipped: true,
            },
          });
        }
      } else {
        await ctx.db.user.update({
          where: { userId: input.userId },
          data: {
            status: input.status,
          },
        });
      }
      //
      return await ctx.db.match.update({
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
          localUserId: input.userId,
          remoteUserId: firstMatch.userId,
          tempPeerId: input.tempId,
        },
      });

      return match;
    }),
  skipsBalance: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      const userSkipsBalance = ctx.db.user.findFirst({
        where: {
          userId: input.userId,
        },
        select: {
          skips: true,
        },
      });
      return userSkipsBalance;
    }),
});
