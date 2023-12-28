import { api } from "~/utils/api";
import { CustImage } from "./custImage";
import { useState } from "react";

export const Poses = ( props: {imageUrl: string} ) => {
    const [showResult, setShowResult] = useState(false);

    const testerInit: number[] = []
    const [tester, setTester] = useState(testerInit);
    const attemptVec: number[] = [];

    // //Vectors should have the same length
    // //Returns scalar between -1 & 1
    // const cosineSimilarity = (vec1: number[], vec2: number[]) => {
    //   //find dot product
    //   let result = 0;
    //   for (let i = 0; i < vec1.length; i++) {
    //     const val1 = vec1[i];
    //     const val2 = vec2[i];
    //     if (val1 && val2) result += val1 * val2;
    //   }

    //   console.log("cosine similarity", result)

    //   return result;
    // }

    // //returns scalar between 0 and 2
    // const findEuclideanDist = (vec1: number[], vec2: number[]) => {
    //   const similarity = cosineSimilarity(vec1, vec2);
    //   return Math.sqrt(2 * (1 - similarity));
    // }

    // const margin = 0.15;
    // const isCorrect = (vec1: number[], vec2: number[]) => {
    //   const score = findEuclideanDist(vec1, vec2);
    //   if (score <= margin) return true
    //   return false;
    // }

    return (
        <div className="flex flex-col justify-center items-center gap-8">
          <button 
            onClick={() => {
              setTester(attemptVec)
              setShowResult(true);
            }}
          >
            Compare pose
          </button>
          <div>
            { showResult && <ResultView name={"T-Pose"} landmarks={tester} />}
            <CustImage id={"target1"} src={props.imageUrl} width={378} height={504} normVec={attemptVec} />
          </div>
        </div>
    )
}

export const ResultView = (props: {name: string, landmarks: number[]}) => {
  const {data: result, isLoading} = api.pose.isCorrectPose.useQuery({name: props.name, landmarks: props.landmarks})

  return (
    <div className="text-xl text-blue-300">
      { isLoading && "Waittt...." }
      { !isLoading && result ? "true" : "false"}
    </div>
  )
}