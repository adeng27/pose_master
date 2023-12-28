import { api } from "~/utils/api";
import { CustImage } from "./custImage";
import { useState } from "react";

export const Poses = ( props: {imageUrl: string} ) => {
    const [showResult, setShowResult] = useState(false);

    const testerInit: number[] = []
    const [tester, setTester] = useState(testerInit);
    const attemptVec: number[] = [];

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
      { !!isLoading && "Waittt...." }
      { !isLoading && result ? "true" : "false"}
    </div>
  )
}