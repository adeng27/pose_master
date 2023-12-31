import Image from "next/image"
import Link from "next/link"
import Layout from "~/components/layout"

export default function HowToPlay() {
    return (
        <Layout>
            <div className="h-fit min-h-screen flex flex-col items-center justify-center gap-12">
                <h1 className="text-3xl font-extrabold">How To Play</h1>
                <div className="m-4 md:m-0 max-w-3xl flex flex-col justify-center items-center gap-8">
                    <Image src="/screenPreview.jpeg" width={231.5} height={363} alt="" />
                    <ol className="flex flex-col gap-3">
                        <li>
                            1. Make sure you enable your webcam! Try to fit as much of 
                            your body inside the frame as possible. Try to be the only person
                            in frame.
                        </li>
                        <li>2. See what pose of the round is and match it before the countdown ends!</li>
                        <li>3. Try to keep up as the timer speeds up.</li>
                    </ol>
                    <p>Wondering how we detect your pose? Check out our <Link href="/about" className="hover:underline text-blue-500">About</Link> page!</p>
                </div>
            </div>
        </Layout>
    )
}