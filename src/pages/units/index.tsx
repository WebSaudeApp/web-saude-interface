import Head from "next/head";
import { useRouter } from "next/router";
import Pagination from "@/components/search/Pagination";
import SearchBar from "@/components/search/SearchBar";
import SearchFacetsSidebar from "@/components/search/SearchFacetsSidebar";
import Unidades from "@/configs/Unidades";

export default function UnidadesPage() {
  const router = useRouter();
  const city = typeof router.query.city === "string" ? router.query.city : "";

  return (
    <>
      <Head>
        <title>Resultados | Web Saúde</title>
      </Head>
      <h1>Resultados{city ? ` em ${city}` : ""}</h1>
      <SearchBar />
      <SearchFacetsSidebar />
      <Pagination page={1} total={0} pageSize={Unidades.config.resultsPerPage} />
    </>
  );
}
