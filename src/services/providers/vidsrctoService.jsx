import axios from "axios";

// Constants
import { VIDSRCTO_BASE_URL } from "@utils/constants";

// Config axios
const vidsrcto = axios.create({
  baseURL: VIDSRCTO_BASE_URL,
});

/**
 * Fetches the embed code for a movie.
 *
 * @param {string} id - The movie ID.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getMovieEmbedTO = async (id) => {
  try {
    const endpoint = `/movie/${id}`;
    const response = await vidsrcto.get(endpoint);

    if (response.status !== 200) {
      return null;
    }

    return VIDSRCTO_BASE_URL + endpoint;
  } catch (error) {
    console.error("Failed to fetch movie embed:", error);
    return null;
  }
};

/**
 * Fetches the embed code for a TV show.
 *
 * @param {string} id - The TV show ID.
 * @param {string} season - The season number.
 * @param {string} episode - The episode number.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getTvEmbedTO = async (id, season, episode) => {
  try {
    const endpoint = `/tv/${id}/${season}/${episode}`;
    const response = await vidsrcto.get(endpoint);

    if (response.status !== 200) {
      return null;
    }

    return VIDSRCTO_BASE_URL + endpoint;
  } catch (error) {
    console.error("Failed to fetch TV show embed:", error);
    return null;
  }
};
