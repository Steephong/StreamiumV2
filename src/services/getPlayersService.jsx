// Services
import { getTvEmbedME, getMovieEmbedME } from "@services/providers/vidsrcmeService";
import { getTvEmbedTO, getMovieEmbedTO } from "@services/providers/vidsrctoService";
import { getMovieEmbedSMASHY, getTvEmbedSMASHY } from "@services/providers/smashyService";

/**
 * Fetches the embed code for a movie.
 *
 * @param {string} mediaType
 * @param {string} id
 * @param {string} season
 * @param {string} episode
 *
 * @returns {Promise} The promise object representing the response.
 */
export const getPlayersService = async (mediaType, id, season, episode) => {
  try {
    let playerList = [];
    let embedUrl1, embedUrl2, embedUrl3;

    if (id && mediaType) {
      const embedFunctions = [];

      if (mediaType === "tv" && season && episode) {
        embedFunctions.push(getTvEmbedME, getTvEmbedTO, getTvEmbedSMASHY);
      } else if (mediaType === "movie") {
        embedFunctions.push(getMovieEmbedME, getMovieEmbedTO, getMovieEmbedSMASHY);
      }

      if (embedFunctions.length > 0) {
        [embedUrl1, embedUrl2, embedUrl3] = await Promise.all(
          embedFunctions.map((getEmbed) => getEmbed(id, season, episode))
        );
      }
    }

    playerList = [
      { player: "Vidsrc.me", embedUrl: embedUrl1 },
      { player: "Vidsrc.to", embedUrl: embedUrl2 },
      { player: "Smashy", embedUrl: embedUrl3 },
    ];

    return playerList;
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return null;
  }
};
