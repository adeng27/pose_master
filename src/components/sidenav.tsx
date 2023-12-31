import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import Image from "next/image";
import Link from "next/link"

export default function Sidenav () {
    const user = useUser();

    return (
        <>
            <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                { !user.isSignedIn && 
                    <SignInButton>
                        <button type="button" className="flex items-center justify-center text-white focus:outline-none focus:ring-4 font-medium rounded-full text-xs p-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Sign In</button>
                    </SignInButton> }
                { !!user.isSignedIn && <UserButton /> }
            </button>

            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-40 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <ul className="space-y-2 font-medium">
                    <li className="flex justify-center">
                        { !user.isSignedIn && 
                            <SignInButton>
                                <button type="button" className="flex items-center justify-center text-white focus:outline-none focus:ring-4 font-medium rounded-full text-xs p-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Sign In</button>
                            </SignInButton> }
                        { !!user.isSignedIn && <UserButton /> }
                    </li>
                    <li className="flex justify-center">
                        <Link href="/play" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <Image src="/frontPose.png" width={20} height={20} alt="" />
                        <span className="ms-3">Play!</span>
                        </Link>
                    </li>
                    <li className="flex justify-center">
                        <Link href="/how-to-play" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                            <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                        </svg>
                        <span className="flex-1 ms-3 whitespace-nowrap text-sm">How To Play</span>
                        </Link>
                    </li>
                    <li className="flex justify-center">
                        <Link href="/about" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                            <path d="M16 14V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v15a3 3 0 0 0 3 3h12a1 1 0 0 0 0-2h-1v-2a2 2 0 0 0 2-2ZM4 2h2v12H4V2Zm8 16H3a1 1 0 0 1 0-2h9v2Z"/>
                        </svg>
                        <span className="flex-1 ms-3 whitespace-nowrap">About</span>
                        </Link>
                    </li>
                </ul>
            </div>
            </aside>
        </>
    )
}