import { DrawingUtils, FilesetResolver, NormalizedLandmark, PoseLandmarker, BoundingBox } from "@mediapipe/tasks-vision";
import Image from "next/image";
import { useRef } from "react";

let poseLandmarker: PoseLandmarker;

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/pose_landmarker_full.task",
      delegate: "GPU"
    },
    runningMode: "IMAGE",
    numPoses: 2
  });
}

let test1: NormalizedLandmark[] | undefined = undefined;
let test2: NormalizedLandmark[] | undefined = undefined;
let test3: NormalizedLandmark[] | undefined = undefined;
const CustImage = (props: {id: string, src: string, height: number, width: number}) => {
    const imageRef = useRef<HTMLImageElement>(null);
  
    const handleClick = () => {
      const imageSrc = imageRef.current!;
      if (poseLandmarker) poseLandmarker.detect(imageSrc, (result) => {

        test3 = result.landmarks[0]

        let maxX = -1;
        let maxY = -1;
        let minX = 2;
        let minY = 2;
        if (test3) {
          for (const elem of test3) {
            if (elem.x > maxX) maxX = elem.x
            if (elem.x < minX) minX = elem.x
            if (elem.y > maxY) maxY = elem.y
            if (elem.y < minY) minY = elem.y
          }
        }

        const boxWidth = (maxX - minX) * props.width;
        const boxHeight = (maxY - minY) * props.height;

        //Fit to bounding box
        if (test3) {
          for (const elem of test3) {
            elem.x -= minX;
            elem.y -= minY;

            elem.x *= props.width;
            elem.y *= props.height;

            elem.x /= boxWidth;
            elem.y /= boxHeight;
          }
        }

        const indArr = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26]
        let temp: NormalizedLandmark[] | undefined = []
        if (test3) for (let i = 0; i < test3.length; i++) {
          if (indArr.includes(i)) {
            let elem = test3[i]
            if (elem) temp.push(elem)
          }
        }

        test3 = temp;

        const arr: number[] = [];
        for (const elem of test3) {
          arr.push(elem.x)
          arr.push(elem.y)
        }

        let sumOfSquares = arr.reduce((acc, val) => acc + val * val, 0);
        const norm = Math.sqrt(sumOfSquares);
        const normalizedArr = arr.map(val => val / norm);

        for (const elem of test3) {
          let num = normalizedArr.shift()
          if (num) elem.x = num;
          num = normalizedArr.shift()
          if (num) elem.y = num;
        }
  
        const canvas = document.createElement("canvas");
        canvas.setAttribute("class", "canvas");
        canvas.setAttribute("width", boxWidth + "px");
        canvas.setAttribute("height", boxHeight + "px");
        
        const div = document.getElementById(props.id)!
        div.appendChild(canvas);
        const canvasCtx = canvas.getContext("2d")!;
        const drawingUtils = new DrawingUtils(canvasCtx);
        // for (const landmark of result.landmarks) {
        //   drawingUtils.drawLandmarks(landmark, {
        //     radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
        //   });
        //   drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
        // }

        if (test3) {
          console.log(test3)
          // const box: BoundingBox = {angle: 0, originX: minX * props.width, originY: minY * props.height, 
          //   width: (maxX - minX) * props.width, height: (maxY - minY) * props.height}
          const box: BoundingBox = {
            angle: 0,
            originX: 0,
            originY: 0,
            width: boxWidth,
            height: boxHeight
          }
          drawingUtils.drawBoundingBox(box, { color: "black", lineWidth: 8 })
          drawingUtils.drawLandmarks(test3);
          // drawingUtils.drawConnectors(test3, PoseLandmarker.POSE_CONNECTIONS);
        }
      })
    }
  
    return (
      <div className="relative">
        <div id={props.id} className="absolute border-solid border-2 border-sky-500"></div>
        <Image 
          src={props.src} 
          height={props.height} 
          width={props.width} 
          ref={imageRef} 
          onClick={() => handleClick()} 
          alt="test" 
        />
        <button className="text-white" onClick={() => {
          let arr: NormalizedLandmark[] | undefined;
          if (poseLandmarker) poseLandmarker.detect(imageRef.current!, (result) => {
            arr = result.landmarks[0]
          })
          if (!test1) {
            test1 = arr;
          }
          else test2 = arr;
        }}>STORE POSE</button>
      </div>
    )
  }

export const Poses = ( props: {imageUrl: string} ) => {

    const dist = (pt1: NormalizedLandmark | undefined, pt2: NormalizedLandmark | undefined) => {
        if (!(pt1 && pt2)) throw new Error("Invalid input in `dist`");
        const xdiff = Math.pow(pt1.x - pt2.x, 2);
        const ydiff = Math.pow(pt1.y - pt2.y, 2);
        const zdiff = Math.pow(pt1.z - pt2.z, 2);
      
        return Math.sqrt(xdiff + ydiff + zdiff)
      }
      
      const predictLocation = (diff: number, spot1: NormalizedLandmark | undefined, spot2: NormalizedLandmark | undefined, 
        origin: NormalizedLandmark | undefined, target: NormalizedLandmark) => {
      
        if (!(spot1 && spot2 && origin)) throw new Error("Invalid input in `predictLocation`");
        const xdiff = (spot2.x - spot1.x) * diff;
        const ydiff = (spot2.y - spot1.y) * diff;
        const zdiff = (spot2.z - spot1.z) * diff;
      
        target.x = origin.x + xdiff;
        target.y = origin.y + ydiff;
        target.z = origin.z + zdiff;
      }
      
      const error = 0.01
      const withinBounds = (actual: NormalizedLandmark | undefined, target: NormalizedLandmark) => {
        if (!actual) throw new Error("Invalid input in `withinBounds`")
        if (target.x === -1) throw new Error("`target` object is unchanged")
      
        if (Math.abs(actual.x - target.x) <= error && Math.abs(actual.y - target.y) <= error 
        && Math.abs(actual.z - target.z) <= error) {
          return true;
        }
        return false;
      }
      
      //0, 1 => left & right shoulders
      //2, 3 => left & right elbows
      //4, 5 => left & right wrists
      //6, 7 => left & right hips
      //8, 9 => left & right knees
      const comparePoses = (pose1: NormalizedLandmark[], pose2: NormalizedLandmark[]) => {
        console.log("Inside comparePoses: ", pose1, pose2)
        const upArmDiff = dist(pose2[0], pose2[2]) / dist(pose1[0], pose1[2]);
      
        //Check left shoulder to left elbow
        const target: NormalizedLandmark = { x: -1, y: -1, z: -1 };
        predictLocation(upArmDiff, pose1[0], pose1[2], pose2[0], target);
        if (!withinBounds(pose2[2], target)) {
          console.log("FAILED AT LEFT SHOULDER TO ELBOW")
          return false;
        }
      
        //Check right shoulder to right elbow
        target.x = -1;
        predictLocation(upArmDiff, pose1[1], pose1[3], pose2[1], target);
        if (!withinBounds(pose2[3], target)) {
          console.log("FAILED AT RIGHT SHOULDER TO ELBOW")
          return false;
        }
      
        //Check forearms
        const forearmDiff = dist(pose2[2], pose2[4]) / dist(pose1[2], pose1[4]);
        target.x = -1;
        predictLocation(forearmDiff, pose1[2], pose1[4], pose2[2], target);
        if (!withinBounds(pose2[4], target)) {
          console.log("FAILED AT LEFT FOREARM")
          return false;
        }
        target.x = -1;
        predictLocation(forearmDiff, pose1[3], pose1[5], pose2[3], target);
        if (!withinBounds(pose2[5], target)) {
          console.log("FAILED AT RIGHT FOREARM")
          return false;
        }
      
        //Check thighs
        const thighDiff = dist(pose2[6], pose2[8]) / dist(pose1[6], pose1[8]);
        target.x = -1;
        predictLocation(thighDiff, pose1[6], pose1[8], pose2[6], target);
        if (!withinBounds(pose2[8], target)) {
          console.log("FAILED AT LEFT THIGH")
          return false;
        }
        target.x = -1;
        predictLocation(thighDiff, pose1[7], pose1[9], pose2[7], target);
        if (!withinBounds(pose2[9], target)) {
          console.log("FAILED AT RIGHT THIGH")
          return false;
        }
      
        return true;
      }

    return (
        <div className="flex flex-col justify-center items-center gap-8">
            <div>
            <CustImage id={"target1"} src={"/IMG_2770.jpg"} width={378} height={504} />
          </div>
          <div>
            <CustImage id={"target2"} src={"/IMG_2771.jpg"} width={378} height={504} />
          </div>
          <div>
            {/* <CustImage id={"target3"} src={"/IMG_2773.jpg"} width={378} height={504} /> */}
            <CustImage id={"target3"} src={props.imageUrl} width={378} height={504} />
          </div>
          <button onClick={() => createPoseLandmarker()} className="text-white">
            click me
          </button>
          <button onClick={() => {
            if (test1 && test2) {
              console.log("Compare poses:", comparePoses(test1, test2))
            }
          }}
          className="text-yellow-500">
            COMPARE POSES
          </button>
        </div>
    )
}