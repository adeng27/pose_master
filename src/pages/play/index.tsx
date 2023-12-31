import { Game } from "~/components/game";
import Layout from "~/components/layout";

export default function Play() {
    return (
        <Layout>
            <Game rounds={3} />
        </Layout>
    )
}