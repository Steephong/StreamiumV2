import React, { useState, useEffect } from "react";

// Libraries
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Services
import { getGenres } from "@services/tmdbService";
import reportWebVitals from "./reportWebVitals";

// Contexts
import { IsMobileProvider, useIsMobile } from "@contexts/IsMobileContext";
import { AuthProvider } from "@contexts/AuthContext";

// Pages
import HomePage from "@pages/HomePage/HomePage";
import NotFoundPage from "@pages/NotFoundPage/NotFoundPage";
import ShowPage from "@pages/ShowPage/ShowPage";
import PlayerPage from "@pages/player/player";
import SignUpPage from "@pages/SignUpPage/SignUpPage";

// Components
import SearchOverlay from "@components/SearchOverlay/SearchOverlay";

// Layouts
import Footer from "@layouts/Footer/Footer";
import Navbar from "@layouts/Navbar/Navbar";

// Styles
import "@styles/fonts.css";
import "@styles/variables.css";
import "@styles/global.css";

const App = () => {
  const [genres, setGenres] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const { isMobile } = useIsMobile();

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch genres for movies and tv shows
  async function fetchGenres() {
    const movieGenres = await getGenres("movie");
    const tvGenres = await getGenres("tv");
    setGenres({ movie: movieGenres, tv: tvGenres });
  }

  // Prevent scrolling when search results are displayed
  if (searchResults && searchQuery !== "") {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  // Wait for isMobile to be defined before rendering the app
  if (isMobile === undefined) {
    return;
  }

  return (
    <Router>
      <Navbar setSearchResults={setSearchResults} setSearchQuery={setSearchQuery} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage genres={genres} />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/:mediaType/:id" element={<ShowPage genres={genres} />} />
          <Route path="/watch/:mediaType/:id" element={<PlayerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {searchResults && searchQuery !== "" && (
        <SearchOverlay searchResults={searchResults} genres={genres} />
      )}
      <Footer />
    </Router>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <IsMobileProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </IsMobileProvider>
    </React.StrictMode>
  );
}

reportWebVitals();
