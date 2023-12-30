import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const poseRouter = createTRPCRouter({
  addPose: publicProcedure
    .input(z.object({ name: z.string(), landmarks: z.array(z.number()), poseNum: z.number() }))
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
                poseNum: input.poseNum,
            }
        })
  }),

  getPose: publicProcedure.input(z.string()).query(async ({ctx, input}) => {
    return await ctx.db.pose.findFirstOrThrow({
        where: {
            name: input,
        }
    })
  }),

  getPoseList: publicProcedure.input(z.number()).query(async ({ctx, input}) => {
    const result: { name: string, landmarks: number[] }[] = [];
    const temp = [0, 1, 2, 3, 4, 5]
    for (let i = 0; i < input; i++) {
        const ind = Math.floor(Math.random() * temp.length)
        const poseNumber = temp[ind];
        temp.splice(ind, 1);

        const randPose = await ctx.db.pose.findFirstOrThrow({
            where: {
                poseNum: poseNumber,
            },
            select: {
                name: true,
                landmarks: true,
            },
        });
        result.push(randPose);
    }
    return result;
  })
});