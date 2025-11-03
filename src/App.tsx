import { useEffect, useState } from "react";
import HaeumHomePage from "@/pages/HaeumHomePage";
import RoaLoadingPage from "@/pages/RoaLoadingPage";

function App(): JSX.Element {
  const [hash, setHash] = useState<string>(window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const route = hash.replace(/^#/, "");

  switch (route) {
    case "/roa":
    case "/loading": // backward compatibility
      return <RoaLoadingPage />;
    case "/":
    case "":
    default:
      return <HaeumHomePage />;
  }
}

export default App;
