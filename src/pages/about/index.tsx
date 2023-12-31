import Link from "next/link"
import Layout from "~/components/layout"

export default function About() {
    return (
        <Layout>
            <div className="h-fit min-h-screen flex flex-col items-center justify-center gap-12">
                <h1 className="text-3xl font-extrabold">About</h1>
                <div className="m-4 md:m-0 max-w-3xl flex flex-col gap-8">
                    <p>
                        Posers! was created by Alastair Deng using Google's MediaPipe framework and Next.js.  
                        Your pose is estimated via machine learning and cosine similarity calculates how accurate your pose is.
                        We are currently working on making Posers! an IOS app. If you have any questions or concerns about
                        Posers!, email adeng27@stanford.edu.
                    </p>
                    <p>
                        Follow Alastair Deng on <Link href="https://github.com/adeng27" target="_blank" className="text-blue-500 hover:underline">Github</Link>
                        , <Link href="https://www.linkedin.com/in/alastair-deng/" target="_blank" className="text-blue-500 hover:underline">LinkedIn</Link>, 
                        and <Link href="https://www.instagram.com/alastairdeng/?hl=en" target="_blank" className="text-blue-500 hover:underline">Instagram</Link>
                    </p>
                </div>
            </div>
        </Layout>
    )
}