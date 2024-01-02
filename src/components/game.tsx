import { PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { createPoseLandmarker, getPoseData, isCorrect } from "./poseLandmarker";
import { api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import { InfoBlurb } from "~/pages";

export const Game = (props: { rounds: number }) => {
    const { data: poseList } = api.pose.getPoseList.useQuery(props.rounds)

    const IMAGE_WIDTH = 414;
    const IMAGE_HEIGHT = 720;

    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);
    const roundTimer = useRef<ReturnType<typeof setTimeout>>();
    const gameTimer = useRef<ReturnType<typeof setTimeout>>();
    const imageRef = useRef<HTMLImageElement>(null);

    //gameStates: 0 -> beforeGame, 1 -> prepForGameStart, 2 -> gameStart, 3 -> seeing photo, 4 -> game over
    const [gameState, setGameState] = useState([true, false, false, false, false]);
    const [roundNum, setRoundNum] = useState(0)
    const [countdown, setCountdown] = useState(5);
    const [cameraFlash, setCameraFlash] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [score, setScore] = useState(0);

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

    const doACountdown = (time: number) => {
        setCountdown(time);
        roundTimer.current = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        setTimeout(() => {
            clearInterval(roundTimer.current);
        }, time * 1000)
    }

    const startCountdown = () => {
        doACountdown(5);

        setTimeout(() => {
            setCountdown(5)
            const elem = document.getElementById("webcam");
            if (elem) elem.setAttribute("style", "display:none")
            setCameraFlash(true)
            setTimeout(() => {
                setCameraFlash(false);
                setGameState([false, false, false, true, false])
                if (paintToCanvas()) takePhoto();
            }, 300)
        }, 5000);
    }

    const startGame = () => {
        gameTimer.current = setInterval(() => {
            setGameState([false, false, true, false, false]);
            setImageUrl("");
            const elem = document.getElementById("webcam");
            if (elem) elem.setAttribute("style", "display:auto") 
            getVideo(); 

            setRoundNum((prev) => prev + 1);
            startCountdown();
            setTimeout(() => {
                if (imageRef.current) {
                    getPoseData(imageRef.current, poseLandmarker, IMAGE_WIDTH, IMAGE_HEIGHT)
                        .then(result => {
                            if (poseList) {
                                const elem = poseList.pop()
                                if (elem) {
                                    if (isCorrect(result, elem.landmarks)) setScore((prev) => prev + 1)
                                    else setScore((prev) => prev - 1)
                                }
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching pose data:", error);
                        });
                }
            }, 6000)
        }, 10000)

        setTimeout(() => {
            clearInterval(gameTimer.current);
        }, props.rounds * 10000)
        setTimeout(() => {
            setGameState([false, false, false, false, true])
        }, (props.rounds + 1) * 10000)
    }

    const StartButton = () => {
        return (
            <button 
                type="button" 
                onClick={async () => {
                    setGameState([false, true, false, false, false]);
                    doACountdown(10);
                    poseLandmarker = await createPoseLandmarker();
                    startGame();
                }}
                className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
            >
                <svg fill="currentColor" className="w-6 h-6" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 17.804">
                    <path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path>
                </svg>
                <span className="sr-only">Start game button</span>
            </button>
        )
    }

    return (
        <div className="h-screen flex justify-center items-center relative">
            <div id="phone-case" className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[720px] w-[414px]">
                <video id="webcam" ref={videoRef} className="rounded-3xl" />
                { imageUrl !== "" && 
                    <Image 
                        src={imageUrl} 
                        alt="" 
                        width={IMAGE_WIDTH}
                        height={IMAGE_HEIGHT}
                        ref={imageRef}
                        className="rounded-3xl"
                    /> 
                }
                {cameraFlash ? <div className="w-full h-full bg-white rounded-3xl" /> :
                <div>
                    <div className="absolute top-2 [text-shadow:_2px_2px_2px_black] flex flex-col justify-center items-center gap-2 w-full">
                        <h1 className="text-2xl">
                            {!gameState[4] && <span>Round {roundNum}/{props.rounds}</span>}
                            {!!gameState[4] && <span>Game Over!</span>}
                        </h1>
                        <h1 className="text-5xl">
                            {gameState[0] && "Posers!"}
                            {gameState[1] && countdown}
                            {gameState[2] && countdown}
                            {gameState[4] && "Posers!"}

                        </h1>
                    </div>
                    <div className="absolute top-1/2 [text-shadow:_2px_2px_2px_black] flex justify-center items-center w-full">
                        <h1>
                            {gameState[1] && <span className="text-3xl">Get ready to pose!</span>}
                            {gameState[2] && <span className="text-4xl font-extrabold">{ "Salute (Right)" }</span>}
                        </h1>
                    </div>
                    <div className="absolute bottom-10 flex flex-col justify-center items-center gap-2 w-full">
                        { !gameState[0] ? 
                            <div id="score" className="text-5xl [text-shadow:_2px_2px_2px_black]">Score: {score}</div>
                            :
                            <StartButton />
                        }
                        {
                            gameState[4] && <Link href="/" className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                                Play again?
                                            </Link>
                        }
                    </div>
                </div>}
                <canvas ref={photoRef} className="hidden" />
            </div>
            <InfoBlurb />
        </div>
    )
}