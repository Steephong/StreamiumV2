import axios from "axios";

// Constants
import { INVIDIOUS_INSTANCES_URL } from "@utils/constants";

/**
 * Fetches the list of Invidious instances.
 *
 * @returns {Promise<string[]>} The list of Invidious instances.
 *
 * @throws {Error} An error if the request fails.
 *
 */
export const INVIDIOUS_INSTANCES_JSON = async () => {
  try {
    const response = await axios.get(INVIDIOUS_INSTANCES_URL);
    const instances = [];

    if (response.status !== 200) {
      return [];
    }

    for (const instance of response.data) {
      if (instance[1].uri && instance[1].type === "https") {
        instances.push(instance[1].uri);
      }
    }

    return instances;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Fetches the video and audio URLs for a given video ID.
 *
 * @param {string} id The video ID.
 * @param {string} videoId The video ID.
 * @param {AbortSignal} signal The signal to cancel the request.
 *
 * @returns {Promise<{index: string, video: string, audio: string}>} The video and audio URLs.
 *
 * @throws {Error} An error if the request fails.
 *
 */
export const getInvidiousVideoAndAudio = async (id, videoId, { signal }) => {
  const instances = await INVIDIOUS_INSTANCES_JSON();

  for (const instance of instances) {
    try {
      const videoDataUrl = `${instance}/api/v1/videos/${videoId}`;
      const response = await axios.get(videoDataUrl, { signal });

      if (response.status === 200) {
        const videoData = response.data;

        const lastMp4Format = videoData.adaptiveFormats
          .filter((format) => format.type.includes("video/mp4"))
          .pop();
        const lastAudioFormat = videoData.adaptiveFormats
          .filter((format) => format.type.includes("audio/mp4"))
          .pop();

        if (lastMp4Format && lastAudioFormat) {
          return {
            index: id,
            video: lastMp4Format.url,
            audio: lastAudioFormat.url,
          };
        }
      } else {
        console.error(`Error with instance ${instance}:`, response);
      }
    } catch (error) {
      console.log(`Error with instance ${instance}:`, error);
    }
  }
};
