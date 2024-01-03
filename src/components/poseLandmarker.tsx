import { FilesetResolver, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import toast from "react-hot-toast";

export const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    const temp =  await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
        modelAssetPath: "/pose_landmarker_full.task",
        delegate: "GPU"
        },
        runningMode: "IMAGE",
        numPoses: 2
    })
    return temp
}

const fitToBoundingBox = (landmarks: NormalizedLandmark[], minX: number, minY:number, 
    boxWidth: number, boxHeight: number, imgWidth: number, imgHeight: number) => {
    for (const elem of landmarks) {
        elem.x -= minX;
        elem.y -= minY;

        elem.x *= imgWidth;
        elem.y *= imgHeight;

        elem.x /= boxWidth;
        elem.y /= boxHeight;
    }
}

const normalizeLandmarks = (landmarks: NormalizedLandmark[], landmarksVector: number[], normVec: number[]) => {
    const sumOfSquares = landmarksVector.reduce((acc, val) => acc + val * val, 0);
    const norm = Math.sqrt(sumOfSquares);
    const normalizedArr = landmarksVector.map(val => val / norm);

    for (const elem of normalizedArr) {
        normVec.push(elem)
    }

    for (const elem of landmarks) {
        let num = normalizedArr.shift()
        if (num) elem.x = num;
        num = normalizedArr.shift()
        if (num) elem.y = num;
    }
}

const combineKeypoints = (landmarks: NormalizedLandmark[], landmarksVector: number[]) => {
    const indArr = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

    for (let i = 0; i < landmarks.length; i++) {
        if (indArr.includes(i)) {
            const elem = landmarks[i]
            if (elem) {
                landmarksVector.push(elem.x);
                landmarksVector.push(elem.y);
            }
        }
    }
}

export const getPoseData = async (imageSrc: HTMLImageElement, poseLandmarker: PoseLandmarker, imgWidth: number, imgHeight: number) => {
    const returnResult: number[] = [];
    if (poseLandmarker) poseLandmarker.detect(imageSrc, (result) => {

      const landmarks = result.landmarks[0]
      if (landmarks?.length === 0 || typeof landmarks === "undefined") toast.error("Pose not detected!")

      let maxX = -1;
      let maxY = -1;
      let minX = 2;
      let minY = 2;
      let boxWidth = 0;
      let boxHeight = 0;

      if (landmarks) {
        for (const elem of landmarks) {
          if (elem.x > maxX) maxX = elem.x
          if (elem.x < minX) minX = elem.x
          if (elem.y > maxY) maxY = elem.y
          if (elem.y < minY) minY = elem.y
        }
        boxWidth = (maxX - minX) * imgWidth;
        boxHeight = (maxY - minY) * imgHeight;

        fitToBoundingBox(landmarks, minX, minY, boxWidth, boxHeight, imgWidth, imgHeight)

        const landmarksVector: number[] = []
        combineKeypoints(landmarks, landmarksVector);

        normalizeLandmarks(landmarks, landmarksVector, returnResult);
      }
    })
    return returnResult;
  }

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
export const isCorrect = (vec1: number[], vec2: number[]) => {
    const score = findEuclideanDist(vec1, vec2);
    console.log(vec1, vec2, score);
    if (score <= margin) return true;
    return false
}