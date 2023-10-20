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
});
