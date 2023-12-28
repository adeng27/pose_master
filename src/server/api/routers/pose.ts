import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const poseRouter = createTRPCRouter({
  addPose: publicProcedure
    .input(z.object({ name: z.string(), landmarks: z.array(z.number()), difficulty: z.number() }))
    .mutation(async ({ctx, input}) => {
        const existingPose = await ctx.db.pose.findFirst({
            where: {
                name: input.name
            }
        });
        if (existingPose) throw new TRPCError({ code: "CONFLICT" });

        return await ctx.db.pose.create({
            data: {
                name: input.name,
                landmarks: input.landmarks,
                difficulty: input.difficulty,
            }
        })
  }),

  getPose: publicProcedure.input(z.string()).query(async ({ctx, input}) => {
    return await ctx.db.pose.findFirstOrThrow({
        where: {
            name: input,
        }
    })
  })
});