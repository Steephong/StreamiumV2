import React, { useEffect, useState, useCallback, useRef } from "react";

// Libraries
import { useNavigate } from "react-router-dom";
import { Parallax, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { InfinitySpin } from "react-loader-spinner";

// Services
import { getTrailers } from "@services/tmdbService";
import { getInvidiousVideoAndAudio } from "@services/invidiousService";

// Assets
import { ReactComponent as DetailsIcon } from "@assets/icons/list-collapse-icon.svg";
import { ReactComponent as PlayIcon } from "@assets/icons/circle-play-icon.svg";
import { ReactComponent as FilledPlayIcon } from "@assets/icons/circle-filled-play-icon.svg";
import { ReactComponent as VolumeIcon } from "@assets/icons/volume-icon.svg";
import { ReactComponent as MuteIcon } from "@assets/icons/mute-icon.svg";
import { ReactComponent as PauseIcon } from "@assets/icons/pause-icon.svg";
import ShowPlaceholder from "@assets/images/show-placeholder.svg";

// Styles
import styles from "./homeSlider.module.css";
import "swiper/css/scrollbar";

// Constants
import {
  IMAGE_W200_URL,
  IMAGE_W500_URL,
  IMAGE_W780_URL,
  IMAGE_OG_URL,
  YT_BASE_URL,
} from "@utils/constants";

const HomePageSlider = React.memo(({ genres, trendingData, isMobile }) => {
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Rating color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 7) {
      return "var(--primary-color)";
    } else if (rating >= 5) {
      return "var(--warning-color)";
    } else if (!rating) {
      return "var(--secondary-color)";
    } else {
      return "var(--error-color)";
    }
  };

  // Fetch trailer for the selected item
  const fetchTrailer = useCallback(async (item, index, signal) => {
    try {
      const trailers = await getTrailers(item.id, item.media_type, { signal });
      item.ytTrailers = trailers;
      const videoId = trailers.find((trailer) => trailer.type === "Trailer")?.key;
      if (videoId) {
        const videoData = await getInvidiousVideoAndAudio(index, videoId, { signal });
        setTrailer(videoData);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to fetch trailer:", error);
      }
    }
  }, []);

  // Handle watching trailer
  const handleWatchTrailer = useCallback(
    async (item, index) => {
      if (!trailer && !isTrailerLoading) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsTrailerLoading(true);
        await fetchTrailer(item, index, controller.signal);
        setIsTrailerLoading(false);
        setIsPaused(false);
      }
    },
    [fetchTrailer, isTrailerLoading, trailer]
  );

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    setVolume(e.target.value);
  }, []);

  // Set volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setIsMuted(volume === "0");
  }, [volume, trailer]);

  // Sync video and audio
  useEffect(() => {
    const syncVideoAndAudio = () => {
      if (videoRef.current && audioRef.current) {
        const diff = videoRef.current.currentTime - audioRef.current.currentTime;
        if (Math.abs(diff) > 0.1) {
          if (diff > 0.1) {
            audioRef.current.currentTime = videoRef.current.currentTime;
          } else {
            videoRef.current.currentTime = audioRef.current.currentTime;
          }
        }
      }
    };

    const interval = setInterval(syncVideoAndAudio, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle mute click
  const handleMuteClick = useCallback(() => {
    setIsMuted((prevIsMuted) => {
      const newMutedState = !prevIsMuted;
      audioRef.current.muted = newMutedState;
      if (!newMutedState && audioRef.current.volume === 0) {
        setVolume(0.15);
      }
      return newMutedState;
    });
  }, []);

  // Handle pause trailer
  const handlePauseTrailer = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      if (isPaused) {
        videoRef.current.play();
        audioRef.current.play();
      } else {
        videoRef.current.pause();
        audioRef.current.pause();
      }
      setIsPaused((prevIsPaused) => !prevIsPaused);
    }
  }, [isPaused]);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    console.log("Video Ended");
    setTrailer(null);
  }, []);

  return (
    <Swiper
      modules={[Parallax, Pagination, Autoplay]}
      style={{
        "--swiper-pagination-bottom": isMobile ? "2%" : "5%",
        "--swiper-pagination-color": "var(--primary-color)",
        "--swiper-pagination-bullet-size": "0.75rem",
        "--swiper-pagination-bullet-inactive-color": "var(--secondary-color)",
        "--swiper-pagination-bullet-inactive-opacity": "0.5",
      }}
      speed={800}
      autoplay={false}
      loop={true}
      parallax={true}
      pagination={{
        clickable: true,
        type: "bullets",
      }}
      slidesPerView={1}
      onActiveIndexChange={(swiper) => {
        if (swiper.activeIndex !== swiper.previousIndex) {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Abort any ongoing fetch
          }
          setTrailer(null);
          setIsTrailerLoading(false);
        }
      }}
      className={styles.homeSlider}
    >
      {trendingData.map((item, index) => (
        <SwiperSlide key={index} className={styles.homeSliderSlide}>
          <div className={styles.backgroundImage}>
            {isTrailerLoading && (
              <div className={styles.LoadingTrailer}>
                <InfinitySpin
                  width="200"
                  color="var(--primary-color)"
                  ariaLabel="infinity-spin-loading"
                />
              </div>
            )}
            {trailer && trailer.video && trailer.audio && index === trailer.index ? (
              <>
                {isPaused && (
                  <div className={styles.isPausedBtn} onClick={handlePauseTrailer}>
                    <PauseIcon />
                  </div>
                )}
                <video
                  style={{
                    filter: isPaused ? "blur(5px)" : "none",
                    opacity: isPaused ? 0.5 : 1,
                    transform: isPaused ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.3s, opacity 0.3s, filter 0.3s, scale 0.3s",
                  }}
                  autoPlay
                  ref={videoRef}
                  onClick={handlePauseTrailer}
                  onEnded={handleVideoEnded}
                >
                  <source src={trailer?.video} type="video/mp4" />
                </video>
                <audio autoPlay ref={audioRef}>
                  <source src={trailer?.audio} type="audio/mp4" />
                </audio>
                <div className={styles.trailerControls}>
                  <div className={styles.volumeControl}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className={styles.volumeSlider}
                    />
                    <div
                      style={{ height: `calc(${volume * 100}% + 0.5rem)` }}
                      className={styles.volumeBar}
                    ></div>
                  </div>

                  <button className={styles.volumeBtn} onClick={handleMuteClick}>
                    {isMuted ? <MuteIcon /> : <VolumeIcon />}
                  </button>
                </div>
              </>
            ) : trailer === undefined && item.ytTrailers ? (
              window.open(`${YT_BASE_URL}${item.ytTrailers[0].key}`)
            ) : null}
            {(!trailer || !trailer.video || !trailer.audio || index !== trailer.index) && (
              <img
                src={
                  isMobile
                    ? `${IMAGE_W780_URL}${
                        item.poster_path || item.backdrop_path || ShowPlaceholder
                      }`
                    : `${IMAGE_OG_URL}${item.backdrop_path || item.poster_path || ShowPlaceholder}`
                }
                alt={item.title}
                loading="lazy"
              />
            )}
          </div>

          <div className={styles.homeSliderContent}>
            <div
              className={`${styles.homeSliderText} ${trailer && !isPaused ? styles.shrink : ""}`}
              data-swiper-parallax="-50%"
            >
              {item.logos?.length ? (
                <img
                  src={`${isMobile ? IMAGE_W200_URL : IMAGE_W500_URL}${item.logos[0].file_path}`}
                  alt={item.title || item.name}
                  className={styles.homeSliderLogo}
                  loading="lazy"
                />
              ) : null}

              <div data-swiper-parallax="-25%" className={styles.titleContainer}>
                <div className={styles.rating}>
                  <svg width="4rem" height="4rem" viewBox="0 0 100 100">
                    <circle
                      className={styles.circle}
                      cx="50"
                      cy="50"
                      r="35"
                      style={{ stroke: getRatingColor(item.vote_average) }}
                    ></circle>
                  </svg>
                  <p>{item.vote_average.toFixed(1) || "N/A"}</p>
                </div>
                <h2>{item.title || item.name}</h2>
              </div>

              <div className={styles.details} data-swiper-parallax="-50%">
                <p>
                  {new Date(item.release_date || item.first_air_date).toLocaleDateString(
                    "en-US",
                    isMobile
                      ? { day: "numeric", month: "numeric", year: "numeric" }
                      : { day: "numeric", month: "short", year: "numeric" }
                  )}
                </p>
                <span className={styles.dotSeparator}>•</span>
                <p>{item.media_type}</p>
                <span className={styles.dotSeparator}>•</span>
                <p>
                  {item.genre_ids
                    .map(
                      (genreId) =>
                        genres[item.media_type]?.find((genre) => genre.id === genreId)?.name
                    )
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div data-swiper-parallax="-75%">
                <p className={styles.overview}>{item.overview}</p>
              </div>
            </div>

            <div className={styles.homeSliderButtons} data-swiper-parallax="-150%">
              <button onClick={() => navigate(`/watch/${item.media_type}/${item.id}`)}>
                <PlayIcon />
                Watch Now
              </button>
              <button onClick={() => handleWatchTrailer(item, index)}>
                <FilledPlayIcon />
                Watch Trailer
              </button>
              <button onClick={() => navigate(`/${item.media_type}/${item.id}`)}>
                <DetailsIcon />
                More Details
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

export default HomePageSlider;
