import axios from "axios";

// Constants
import { TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from "@utils/constants";

// Config axios
const tmdbService = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
});
/**
 * Fetches all trending movies for a specified period from the TMDB API.
 *
 * @param {string} period - The period for which to fetch trending movies ('day' or 'week').
 * @param {string} [language] - The language of the movies to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of trending movies, or an empty array in case of an error.
 */
export const getAllTrendingMovies = async (period = "week", language = undefined) => {
  try {
    const endpoint = `/trending/movie/${period}`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch trending movies: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all trending series for a specified period from the TMDB API.
 *
 * @param {string} period - The period for which to fetch trending series ('day' or 'week').
 * @param {string} [language] - The language of the series to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of trending series, or an empty array in case of an error.
 */
export const getAllTrendingSeries = async (period = "week", language = undefined) => {
  try {
    const endpoint = `/trending/tv/${period}`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch trending series: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all trending content content for a specified period from the TMDB API.
 *
 * @param {string} period - The period for which to fetch trending content ('day' or 'week').
 * @param {string} [language] - The language of the content to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of trending content, or an empty array in case of an error.
 */
export const getAllTrending = async (
  period = "week",
  maxItems = undefined,
  language = undefined
) => {
  try {
    const endpoint = `/trending/all/${period}`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    return maxItems ? response.data.results.slice(0, maxItems) : response.data.results;
  } catch (error) {
    console.error(`Failed to fetch trending content: ${error.message}`);
    return [];
  }
};

/**
 * Searches for MultiSearch content from the TMDB API.
 *
 * @param {string} query - The query to search for.
 * @param {string} [language] - The language of the content to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of search results, or an empty array in case of an error.
 */
export const search = async (query, language = undefined, page = undefined) => {
  try {
    const endpoint = "/search/multi";
    const params = { query, language, page };
    const response = await tmdbService.get(endpoint, { params });

    const results = response.data.results;
    const filteredResults = results.filter((result) => result.media_type !== "person");

    return filteredResults;
  } catch (error) {
    console.error(`Failed to fetch search results: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all popular series from the TMDB API.
 *
 * @param {string} [language] - The language of the series to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of popular series, or an empty array in case of an error.
 */
export const getPopularSeries = async (language = undefined) => {
  try {
    const endpoint = "/tv/popular";
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch popular series: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all popular movies from the TMDB API.
 *
 * @param {string} [language] - The language of the movies to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of popular movies, or an empty array in case of an error.
 */
export const getPopularMovies = async (language = undefined) => {
  try {
    const endpoint = "/movie/popular";
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch popular movies: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all top-rated series from the TMDB API.
 *
 * @param {string} [language] - The language of the series to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of top-rated series, or an empty array in case of an error.
 */
export const getTopRatedSeries = async (language = undefined) => {
  try {
    const endpoint = "/tv/top_rated";
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch top-rated series: ${error.message}`);
    return [];
  }
};

/**
 * Fetches all top-rated movies from the TMDB API.
 *
 * @param {string} [language] - The language of the movies to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of top-rated movies, or an empty array in case of an error.
 */
export const getTopRatedMovies = async (language = undefined) => {
  try {
    const endpoint = "/movie/top_rated";
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch top-rated movies: ${error.message}`);
    return [];
  }
};

/**
 * Fetches the best movies and series sorted by rating from the TMDB API.
 * The result is a mix of movies and series.
 *
 * @param {string} [language] - The language of the content to fetch (ISO 639-1 code). Optional.
 *
 */
export const getBestRatedShows = async (language = undefined) => {
  try {
    const movies = (await getTopRatedMovies(language)).map((movie) => ({
      ...movie,
      media_type: "movie",
    }));
    const series = (await getTopRatedSeries(language)).map((serie) => ({
      ...serie,
      media_type: "tv",
    }));
    const bestRatedShows = [...movies, ...series]
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 10);

    return bestRatedShows;
  } catch (error) {
    console.error(`Failed to fetch best movies and series: ${error.message}`);
    return [];
  }
};

/**
 * Fetches images for a specific movie or series from the TMDB API.
 *
 * @param {number} id - The ID of the movie or series to fetch images for.
 * @param {string} type - The type of content to fetch images for ('movie' or 'tv').
 * @param {string} [language] - The language of the images to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of images, or an empty array in case of an error.
 */
export const getLogos = async (id, type, language = "en") => {
  try {
    const endpoint = `/${type}/${id}/images`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.logos;
  } catch (error) {
    console.error(`Failed to fetch images: ${error.message}`);
    return [];
  }
};

/**
 * Fetches genres for movies or series from the TMDB API.
 *
 * @param {string} type - The type of content to fetch genres for ('movie' or 'tv').
 * @param {string} [language] - The language of the genres to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of genres, or an empty array in case of an error.
 */
export const getGenres = async (type, language = "en") => {
  try {
    const endpoint = `/genre/${type}/list`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.genres;
  } catch (error) {
    console.error(`Failed to fetch genres: ${error.message}`);
    return [];
  }
};

/**
 * Fetches the upcoming movies from the TMDB API.
 *
 * @param {string} [language] - The language of the movies to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of upcoming movies, or an empty array in case of an error.
 */
export const getUpcomingMovies = async (language = undefined) => {
  try {
    const endpoint = "/movie/upcoming";
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    const currentDate = new Date();
    response.data.results = response.data.results.filter(
      (movie) => new Date(movie.release_date) > currentDate
    );
    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch upcoming movies: ${error.message}`);
    return [];
  }
};

/**
 * Fetches on the air series from the TMDB API.
 *
 * @param {string} [language] - The language of the series to fetch (ISO 639-1 code). Optional.
 * @param {number} [page] - The page number to fetch. Optional.
 * @param {string} [timezone] - The timezone to use for the query. Optional.
 *
 * @returns {Promise<Array>} An array of on the air series, or an empty array in case of an error.
 */
export const getOnTheAirSeries = async (language = undefined, page = 1, timezone = undefined) => {
  try {
    const endpoint = "/tv/on_the_air";
    let params = { language, page, timezone };
    let response = await tmdbService.get(endpoint, { params });

    response.data.results = response.data.results.filter((serie) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(serie.first_air_date) > oneMonthAgo;
    });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    if (response.data.results.length < 5) {
      response.data.results = response.data.results.concat(
        await getOnTheAirSeries(language, page + 1, timezone)
      );
    }

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch on the air series: ${error.message}`);
    return [];
  }
};

/**
 * Fetches the movies in theaters from the TMDB API.
 *
 * @param {string} [language] - The language of the movies to fetch (ISO 639-1 code). Optional.
 * @param {number} [page] - The page number to fetch. Optional.
 * @param {string} [region] - The region to use for the query. Optional.
 */
export const getMoviesInTheaters = async (language = undefined, page = 1, region = undefined) => {
  try {
    const endpoint = "/movie/now_playing";
    const params = { language, page, region };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch movies in theaters: ${error.message}`);
    return [];
  }
};

/**
 * Fetches details for a specific movie or series from the TMDB API.
 *
 * @param {number} id - The ID of the movie or series to fetch details for.
 * @param {string} mediaType - The type of content to fetch details for ('movie' or 'tv').
 * @param {string} [append_to_response] - The additional information to fetch. Optional.
 *
 */
export const getShowDetails = async (id, mediaType, append_to_response = undefined) => {
  try {
    const endpoint = `/${mediaType}/${id}`;
    const params = { append_to_response };
    const response = await tmdbService.get(endpoint, { params });

    if (response.data.seasons) {
      response.data.seasons = response.data.seasons.filter((season) => season.name !== "Specials");
    }

    if (response.data.adult === false) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Failed to fetch details: ${error.message}`);
    return [];
  }
};

/**
 * Fetches details for a specific season of a TV show from the TMDB API.
 *
 * @param {number} id - The ID of the TV show.
 * @param {number} season_number - The season number.
 *
 * @returns {Promise<Object>} The details of the season.
 */
export const getSeasonDetails = async (id, season_number) => {
  try {
    const endpoint = `/tv/${id}/season/${season_number}`;
    const params = {};
    const response = await tmdbService.get(endpoint, { params });

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch season details: ${error.message}`);
    return [];
  }
};

/**
 * Fetches videos for a specific movie or series from the TMDB API.
 *
 * @param {number} id - The ID of the movie or series to fetch videos for.
 * @param {string} mediaType - The type of content to fetch videos for ('movie' or 'tv').
 * @param {string} [language] - The language of the videos to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of videos, or an empty array in case of an error.
 */
export const getTrailers = async (id, mediaType, language = undefined) => {
  try {
    const endpoint = `/${mediaType}/${id}/videos`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });
    const trailer = response.data.results.filter((video) => video.type === "Trailer");

    return trailer;
  } catch (error) {
    console.error(`Failed to fetch videos: ${error.message}`);
    return [];
  }
};

/**
 * Fetches keywords for a specific movie or series from the TMDB API.
 *
 * @param {number} id - The ID of the movie or series to fetch keywords for.
 * @param {string} mediaType - The type of content to fetch keywords for ('movie' or 'tv').
 * @param {string} [language] - The language of the keywords to fetch (ISO 639-1 code). Optional.
 *
 * @returns {Promise<Array>} An array of keywords, or an empty array in case of an error.
 */
export const getKeywords = async (id, mediaType, language = undefined) => {
  try {
    const endpoint = `/${mediaType}/${id}/keywords`;
    const params = { language };
    const response = await tmdbService.get(endpoint, { params });

    return response.data.keywords;
  } catch (error) {
    console.error(`Failed to fetch keywords: ${error.message}`);
    return [];
  }
};
