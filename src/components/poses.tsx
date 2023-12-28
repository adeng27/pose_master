import { CustImage } from "./custImage";

export const Poses = ( props: {imageUrl: string} ) => {

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

      console.log("cosine similarity", result)

      return result;
    }

    //returns scalar between 0 and 2
    const findEuclideanDist = (vec1: number[], vec2: number[]) => {
      const similarity = cosineSimilarity(vec1, vec2);
      return Math.sqrt(2 * (1 - similarity));
    }

    const idealVec = [0.18524380649642752, 0.012459343124820893, 0.22759957713004525, 0.043303350899495545, 0.1347904275079755, 0.04467234417766422, 0.28841686761534374, 0.03862719640933583, 0.08551147949044349, 0.04499768535910111, 0.3571568775129372, 0.0237200789929649, 0.021825018133979485, 0.04383588803471717, 0.2057290197128731, 0.19727270292718296, 0.16050994402966665, 0.19777722313501536, 0.20149839014580787, 0.2768812072939942, 0.16452136678886037, 0.274693171470825, 0.19901230718507606, 0.33935149855901625, 0.17690259313497814, 0.33938947227137]
    const attemptVec: number[] = [];
    // const idealVec = [0.6, 0.8]

    return (
        <div className="flex flex-col justify-center items-center gap-8">
          {/* <div>
            <CustImage id={"target1"} src={"/IMG_2770.jpg"} width={378} height={504} normVec={attemptVec} />
          </div> */}
          <div>
            <CustImage id={"target2"} src={"/IMG_2773.jpg"} width={378} height={504} normVec={attemptVec} />
          </div>
          <div>
            <CustImage id={"target3"} src={props.imageUrl} width={378} height={504} normVec={attemptVec} />
          </div>
          <button 
            onClick={() => {
              console.log(attemptVec);
              console.log("Distance: ", findEuclideanDist(idealVec, attemptVec))
            }}
            className="text-blue-500"
          >
            Compare Poses
          </button>
        </div>
    )
}