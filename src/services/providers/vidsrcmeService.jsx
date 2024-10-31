import axios from "axios";

// Constants
import { VIDSRCME_BASE_URL } from "@utils/constants";

// Config axios
const vidsrcme = axios.create({
  baseURL: VIDSRCME_BASE_URL,
});

/**
 * Fetches the embed code for a movie.
 *
 * @param {string} id - The movie ID.
 * @param {string} ds_lang - Default subtitle language, ISO639 Language code.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getMovieEmbedME = async (id, ds_lang = "en") => {
  try {
    const endpoint = `/movie/${id}${ds_lang ? `?ds_lang=${ds_lang}` : ""}`;
    const response = await vidsrcme.get(endpoint);
    const emptyTitleRegex = /<title>\s*<\/title>/;

    if (response.status !== 200 || emptyTitleRegex.test(response.data)) {
      return null;
    }

    return VIDSRCME_BASE_URL + endpoint;
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
 * @param {string} ds_lang - Default subtitle language, ISO639 Language code.
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getTvEmbedME = async (id, season, episode, ds_lang = "en") => {
  try {
    const endpoint = `/tv/${id}/${season}-${episode}${ds_lang ? `?ds_lang=${ds_lang}` : ""}`;
    const response = await vidsrcme.get(endpoint);
    const emptyTitleRegex = /<title>\s*<\/title>/;

    if (response.status !== 200 || emptyTitleRegex.test(response.data)) {
      return null;
    }

    return VIDSRCME_BASE_URL + endpoint;
  } catch (error) {
    console.error("Failed to fetch TV show embed:", error);
    return null;
  }
};
