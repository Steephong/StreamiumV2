import React, { useEffect, useState, useMemo } from "react";

// Services
import {
  getAllTrending,
  getLogos,
  getBestRatedShows,
  getPopularMovies,
  getPopularSeries,
  getUpcomingMovies,
  getOnTheAirSeries,
  getMoviesInTheaters,
} from "@services/tmdbService";

// Contexts
import { useIsMobile } from "@contexts/IsMobileContext";

// Components
import HomeSlider from "@components/HomeSlider/HomeSlider";
import TrendingSlider from "@components/TrendingSlider/TrendingSlider";
import BestRatedSlider from "@components/BestRatedSlider/BestRatedSlider";
import PopularShowsSlider from "@components/PopularShowsSlider/PopularShowsSlider";
import UpcomingAndAirSlider from "@components/UpcomingAndAirSlider/UpcomingAndAirSlider";

// Styles
// import styles from "./homePage.module.css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

// Constants
import { MAIN_MAX_ITEMS, MAX_ITEMS } from "@utils/constants";

const CACHE_KEY = "homePageData";
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

const HomePage = ({ genres }) => {
  const [data, setData] = useState(() => {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = new Date().getTime();
    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION_MS) {
      return cachedData.data;
    }
    return {
      trendingData: null,
      trendingDataWeek: null,
      bestRatedShows: null,
      popularMovies: null,
      popularSeries: null,
      upcomingMovies: null,
      onTheAirSeries: null,
      inTheaters: null,
    };
  });

  const { isMobile } = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      const fetchTrending = async (timeWindow, maxItems) => {
        const data = await getAllTrending(timeWindow, maxItems);
        const updatedData = await Promise.all(
          data.map(async (item) => {
            const logos = await getLogos(item.id, item.media_type);
            return { ...item, logos };
          })
        );
        return updatedData;
      };

      const [
        trendingData,
        trendingDataWeek,
        bestRatedShows,
        popularMovies,
        popularSeries,
        upcomingMovies,
        onTheAirSeries,
        inTheaters,
      ] = await Promise.all([
        fetchTrending("day", MAIN_MAX_ITEMS),
        fetchTrending("week", MAX_ITEMS),
        getBestRatedShows(MAX_ITEMS),
        getPopularMovies(MAX_ITEMS),
        getPopularSeries(MAX_ITEMS),
        getUpcomingMovies(MAX_ITEMS),
        getOnTheAirSeries(MAX_ITEMS),
        getMoviesInTheaters(MAX_ITEMS),
      ]);

      const fetchedData = {
        trendingData,
        trendingDataWeek,
        bestRatedShows,
        popularMovies,
        popularSeries,
        upcomingMovies,
        onTheAirSeries,
        inTheaters,
      };

      setData(fetchedData);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: fetchedData, timestamp: new Date().getTime() })
      );
    };

    if (!data.trendingData) {
      fetchData();
    }
  }, [data]);

  // Memoize data
  const memoizedData = useMemo(() => data, [data]);

  // If genres are not loaded yet, no need to render the page
  if (!genres) {
    return null;
  }

  // Destructure data for easier access
  const {
    trendingData,
    trendingDataWeek,
    bestRatedShows,
    popularMovies,
    popularSeries,
    upcomingMovies,
    onTheAirSeries,
    inTheaters,
  } = memoizedData;

  return (
    <>
      {trendingData && (
        <HomeSlider genres={genres} trendingData={trendingData} isMobile={isMobile} />
      )}

      {trendingDataWeek && (
        <TrendingSlider trendingDataWeek={trendingDataWeek} genres={genres} isMobile={isMobile} />
      )}

      {bestRatedShows && (
        <BestRatedSlider bestRatedShows={bestRatedShows} genres={genres} isMobile={isMobile} />
      )}

      {popularMovies && (
        <PopularShowsSlider
          popularShows={popularMovies}
          genres={genres}
          showType={"movie"}
          isMobile={isMobile}
        />
      )}

      {popularSeries && (
        <PopularShowsSlider
          popularShows={popularSeries}
          genres={genres}
          showType={"tv"}
          isMobile={isMobile}
        />
      )}

      {upcomingMovies && onTheAirSeries && inTheaters && (
        <UpcomingAndAirSlider
          upcomingMovies={upcomingMovies}
          onTheAirSeries={onTheAirSeries}
          inTheaters={inTheaters}
          genres={genres}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default HomePage;
