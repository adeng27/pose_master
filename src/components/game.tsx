import { PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { createPoseLandmarker, getPoseData } from "./poseLandmarker";
import { api } from "~/utils/api";

export const Game = () => {
    const IMAGE_WIDTH = 414;
    const IMAGE_HEIGHT = 720;

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const currentTimer = useRef<ReturnType<typeof setTimeout>>();
    const imageRef = useRef<HTMLImageElement>(null);

    const [countdown, setCountdown] = useState(5);
    const [score, setScore] = useState(0);
    const [cameraFlash, setCameraFlash] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    // const propVec: number[] = [];
    // const argVecInit: number[] = [];
    // const [argVec, setArgVec] = useState(argVecInit);

    useEffect(() => {
        getVideo();
      }, [videoRef]);

    let poseLandmarker: PoseLandmarker;

    const getVideo = () => {
        navigator.mediaDevices
          .getUserMedia({ video: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT} })
          .then(async stream => {
            const video = videoRef.current!;
            video.srcObject = stream;
            await video.play();
          })
          .catch(err => {
            console.error("error:", err);
          });
    };

    const paintToCanvas = () => {
        const video = videoRef.current!;
        const photo = photoRef.current!;
        const ctx = photo.getContext('2d')!;

        const width = IMAGE_WIDTH;
        const height = IMAGE_HEIGHT;
        photo.width = width;
        photo.height = height;

        ctx.drawImage(video, 0, 0, width, height);
        return true;
    };

    const takePhoto = () => {
        const photo = photoRef.current!;

        const data = photo.toDataURL('image/jpeg');
        setImageUrl(data);

        // console.warn(data);
    };

    const startCountdown = () => {
        currentTimer.current = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        setTimeout(() => {
            clearInterval(currentTimer.current);
            setCountdown(5)
            const elem = document.getElementById("test");
            if (elem) elem.setAttribute("style", "display:none")
            setCameraFlash(true)
            setTimeout(() => {
                setCameraFlash(false);
                if (paintToCanvas()) takePhoto();
                // if (elem) elem.setAttribute("style", "display:auto") //Show custImage now?
                // getVideo(); //Show custImage now?
            }, 300)
        }, 5000);
    }

    const startGame = () => {
        startCountdown();
        setTimeout(() => {
            if (imageRef.current) {
                getPoseData(imageRef.current, poseLandmarker, IMAGE_WIDTH, IMAGE_HEIGHT)
                    .then(result => {
                        console.log(result);
                    })
                    .catch(error => {
                        console.error("Error fetching pose data:", error);
                    });
            }
        }, 6000)
    }

    const StartButton = () => {
        return (
            <button 
                type="button" 
                onClick={async () => {
                    poseLandmarker = await createPoseLandmarker();
                    startGame();
                }}
                className="absolute bottom-10 left-[184px] text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
            >
                <svg fill="currentColor" className="w-6 h-6" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 17.804">
                    <path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path>
                </svg>
                <span className="sr-only">Start game button</span>
            </button>
        )
    }

    return (
        <div className="h-screen flex flex-col justify-center items-center">
            
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[720px] w-[414px]">
                <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <video id="test" ref={videoRef} className="rounded-3xl" />
                { imageUrl !== "" && 
                    <img 
                        src={imageUrl} 
                        alt="" 
                        ref={imageRef}
                        className="rounded-3xl"
                    /> 
                }
                {cameraFlash ? <div className="w-full h-full bg-white rounded-3xl" /> :
                <div>
                    <h1 className="absolute top-8 left-1/2 text-5xl [text-shadow:_2px_2px_2px_black]">{countdown}</h1>
                    <h1 className="absolute bottom-10 left-4 text-2xl [text-shadow:_2px_2px_2px_black]">Score: {score}</h1>
                    <StartButton />
                </div>}
                <canvas ref={photoRef} className="hidden" />
            </div>
        </div>
    )
}

const ScoreView = (props: {name: string, landmarks: number[]}) => {
    const {data: result, isLoading} = api.pose.isCorrectPose.useQuery({name: props.name, landmarks: props.landmarks});
    const [score, setScore] = useState(0)

    return (
        <h1>{score}</h1>
    )
}