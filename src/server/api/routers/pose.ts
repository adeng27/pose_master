import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const NUMBER_OF_POSES = 1;

//Vectors should have the same length
//Returns scalar between -1 & 1
const cosineSimilarity = (vec1: number[], vec2: number[]) => {
    //find dot product
    let result = 0;
    for (let i = 0; i < vec1.length; i++) {
        const val1 = vec1[i];
        const val2 = vec2[i];
        if (val1 && val2) result += val1 * val2;
    }

    return result;
}

//returns scalar between 0 and 2
const findEuclideanDist = (vec1: number[], vec2: number[]) => {
    const similarity = cosineSimilarity(vec1, vec2);
    return Math.sqrt(2 * (1 - similarity));
}

const margin = 0.15;
const isCorrect = (vec1: number[], vec2: number[]) => {
    const score = findEuclideanDist(vec1, vec2);
    if (score <= margin) return true;
    return false
}

/*************************************************************/

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

  isCorrectPose: publicProcedure
  .input(z.object({ name: z.string(), landmarks: z.array(z.number()) }))
  .query(async ({ctx, input}) => {
    const existingPose = await ctx.db.pose.findFirst({
        where: {
            name: input.name
        }
    });
    if (!existingPose) throw new TRPCError({ code: "BAD_REQUEST" });

    console.log(input.landmarks, findEuclideanDist(existingPose.landmarks, input.landmarks))
    return isCorrect(existingPose.landmarks, input.landmarks);
  }),

  getPoseList: publicProcedure.input(z.number()).query(async ({ctx, input}) => {
    const result: { name: string, landmarks: number[] }[] = [];

  })
});