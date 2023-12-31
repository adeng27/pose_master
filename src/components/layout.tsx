import Sidenav from "./sidenav"

export default function Layout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <div>
            <Sidenav />
            <section className="flex justify-center">{children}</section>
        </div>
    )
  }