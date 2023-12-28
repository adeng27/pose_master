import { BoundingBox, DrawingUtils, FilesetResolver, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import Image from "next/image";
import { useRef } from "react";

export const CustImage = (props: { id: string, src: string, height: number, width: number}) => {
    const imageRef = useRef<HTMLImageElement>(null);
    let poseLandmarker: PoseLandmarker;

    const createPoseLandmarker = async () => {
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
                              width: number, height: number) => {
      for (const elem of landmarks) {
        elem.x -= minX;
        elem.y -= minY;

        elem.x *= props.width;
        elem.y *= props.height;

        elem.x /= width;
        elem.y /= height;
      }
    }

    const normalizeLandmarks = (landmarks: NormalizedLandmark[], landmarksVector: number[]) => {
      let sumOfSquares = landmarksVector.reduce((acc, val) => acc + val * val, 0);
      const norm = Math.sqrt(sumOfSquares);
      const normalizedArr = landmarksVector.map(val => val / norm);

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

    const prepForGraphing = (landmarks: NormalizedLandmark[]) => {
      const replace: NormalizedLandmark[] = []
      for (let i = 0; i < 13; i++) {
          const elem = landmarks[i]
          if (elem) replace.push(elem)
      }
      return replace;
    }
  
    const handleClick = async () => {
      const imageSrc = imageRef.current!;
      poseLandmarker = await createPoseLandmarker();
      if (poseLandmarker) poseLandmarker.detect(imageSrc, (result) => {

        let landmarks = result.landmarks[0]

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
          boxWidth = (maxX - minX) * props.width;
          boxHeight = (maxY - minY) * props.height;

          fitToBoundingBox(landmarks, minX, minY, boxWidth, boxHeight)

          const landmarksVector: number[] = []
          combineKeypoints(landmarks, landmarksVector);

          normalizeLandmarks(landmarks, landmarksVector);

          //Purely for graphing
          landmarks = prepForGraphing(landmarks)
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

        if (landmarks) {
          console.log(landmarks)
          const box: BoundingBox = {
            angle: 0,
            originX: 0,
            originY: 0,
            width: boxWidth,
            height: boxHeight
          }
          drawingUtils.drawBoundingBox(box, { color: "black", lineWidth: 8 })
          drawingUtils.drawLandmarks(landmarks);
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
      </div>
    )
  }