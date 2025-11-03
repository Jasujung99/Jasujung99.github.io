import { useEffect, useState } from "react";
import HaeumHomePage from "@/pages/HaeumHomePage";
import RoaLoadingPage from "@/pages/RoaLoadingPage";
import DocBot from "@/components/DocBot";

function App(): JSX.Element {
  const [hash, setHash] = useState<string>(window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const route = hash.replace(/^#/, "");

  let page: JSX.Element;
  switch (route) {
    case "/roa":
    case "/loading": // backward compatibility
      page = <RoaLoadingPage />;
      break;
    case "/":
    case "":
    default:
      page = <HaeumHomePage />;
      break;
  }

  return (
    <>
      {page}
      <DocBot />
    </>
  );
}

export default App;
