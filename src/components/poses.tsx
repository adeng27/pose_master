import { FilesetResolver, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { CustImage } from "./custImage";

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
        </div>
    )
}