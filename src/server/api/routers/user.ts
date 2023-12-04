import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
          reports: true,
          lastReport: true,
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
            userId: input.userId,
          },
        },
        select: {
          userId: true,
        },
      });

      if (!firstMatch) return null;

      try {
        await ctx.db.$transaction([
          ctx.db.user.update({
            where: { userId: input.userId },
            data: {
              status: "waiting",
              // other fields based on the second logic
            },
          }),
          ctx.db.user.update({
            where: { userId: firstMatch.userId, status: "looking" },
            data: {
              status: "waiting",
              // other fields based on the first logic
            },
          }),
        ]);
      } catch (error) {
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("ERROR IN TRYING TO UPDATE BOTH AT THE SAME TIME");
        return null;
      }

      const match = await ctx.db.match.create({
        data: {
          localUserId: input.userId,
          remoteUserId: firstMatch.userId,
          tempPeerId: input.tempId,
        },
      });

      setTimeout(() => {
        const endFunc = async () => {
          await ctx.db.match.update({
            where: { id: match.id },
            data: { status: "ended" },
          });
        };
        endFunc().catch(() => console.log("Error in Ending match in sync"));
      }, 9000);

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
        select: {
          id: true,
          localUserId: true,
          tempPeerId: true,
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
      if (!input.matchid) return;
      return await ctx.db.match.update({
        where: { id: input.matchid },
        data: {
          status: "ended",
        },
      });
    }),
  statusUpdate: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        status: z.boolean().nullable(),
        skips: z.boolean().nullable(),
        hypeLikes: z.number().nullable(),
        hypeHearts: z.number().nullable(),
        hypeLaughs: z.number().nullable(),
        hypeWoahs: z.number().nullable(),
        hypeFires: z.number().nullable(),
        hypeClaps: z.number().nullable(),
        // report: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //Check User
      if (!input.userId) return null;

      // Define a mapping between input keys and database fields
      const hypeReactionMapping = {
        hypeLikes: "likes",
        hypeHearts: "hearts",
        hypeLaughs: "laughs",
        hypeWoahs: "woahs",
        hypeFires: "fires",
        hypeClaps: "claps",
      };

      // Build the data object for the update
      const updateData: Record<string, unknown> = {};

      // Update user status
      if (input.status !== null) {
        updateData.status = "looking";
      }
      // Update user skips
      if (input.skips !== null) {
        updateData.skips = { decrement: 1 };
      }

      Object.keys(hypeReactionMapping).forEach((hypeKey) => {
        const regularKey =
          hypeReactionMapping[hypeKey as keyof typeof hypeReactionMapping];

        if (input[hypeKey as keyof typeof hypeReactionMapping] !== null) {
          // Update hype reaction with the provided value
          updateData[hypeKey] =
            input[hypeKey as keyof typeof hypeReactionMapping];

          // Increment regular reaction field by 1
          updateData[regularKey] = { increment: 1 };
        }
      });

      // Perform the update
      return await ctx.db.user.update({
        where: { userId: input.userId },
        data: updateData,
      });
    }),
  report: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        report: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { userId: input.userId },
        data: {
          reports: { increment: input.report },
          lastReport: new Date(),
        },
      });
    }),
  dismiss: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { userId: input.userId },
        // select: {
        //   reports: true,
        // },
        data: {
          reports: { decrement: 1 },
        },
      });
    }),
});
