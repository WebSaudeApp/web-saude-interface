import Head from "next/head";
import SearchBar from "@/components/search/SearchBar";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Web Saúde</title>
      </Head>
      <section>
        <h1>Encontre saúde de qualidade, onde você estiver.</h1>
        <p>Encontre hospitais e clínicas perto de você.</p>
        <SearchBar />
      </section>
    </>
  );
}
