import axios from "axios";

// Constants
import { SMASHY_BASE_URL } from "@utils/constants";

// Config axios
const smashy = axios.create({
  baseURL: SMASHY_BASE_URL,
});

/**
 * Fetches the embed code for a movie.
 *
 * @param {string} id - The TMDB movie ID.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getMovieEmbedSMASHY = async (id) => {
  try {
    const endpoint = `/movie/${id}`;
    const response = await smashy.get(endpoint);

    if (response.status !== 200) {
      return null;
    }

    return SMASHY_BASE_URL + endpoint;
  } catch (error) {
    console.error("Failed to fetch movie embed:", error);
    return null;
  }
};

/**
 * Fetches the embed code for a TV show.
 *
 * @param {string} id - The TMDB TV show ID.
 * @param {string} season - The season number.
 * @param {string} episode - The episode number.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getTvEmbedSMASHY = async (id, season, episode) => {
  try {
    const endpoint = `/tv/${id}`;
    const params = { s: season, e: episode };
    const response = await smashy.get(endpoint, { params });

    if (response.status !== 200) {
      return null;
    }

    return SMASHY_BASE_URL + endpoint + `?s=${season}&e=${episode}`;
  } catch (error) {
    console.error("Failed to fetch TV show embed:", error);
    return null;
  }
};
