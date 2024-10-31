import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { InfinitySpin } from "react-loader-spinner";
import Select from "react-select";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getShowDetails, getSeasonDetails } from "@services/tmdbService";
import { getPlayersService } from "@services/getPlayersService";
import PageNotFound from "../NotFoundPage/NotFoundPage";
import CommentSection from "@components/CommentSection/CommentSection";
import { ReactComponent as AlertIcon } from "@assets/icons/warning-icon.svg";
import { ReactComponent as TvIcon } from "@assets/icons/tv-icon.svg";
import { ReactComponent as ArrowRightIcon } from "@assets/icons/chevron-right-icon.svg";
import { IMAGE_W300_URL } from "@utils/constants";
import styles from "./player.module.css";
import "swiper/css/free-mode";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? "2px solid var(--text-color)" : "2px solid var(--text-color)",
    borderRadius: "var(--border-radius-small)",
    backgroundColor: "transparent",
    color: "var(--text-color)",
    fontSize: "var(--font-size-small)",
    fontWeight: "bold",
    textAlign: "center",
    cursor: "pointer",
    boxSizing: "border-box",
    boxShadow: "none",
    width: "8rem",
    height: "2rem",
    minHeight: "none",
    "&:hover": {
      borderColor: "var(--primary-color)",
    },
    "&:focus": {
      borderColor: "var(--primary-color)",
      outline: "none",
      boxShadow: "none",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    color: "var(--background-color)",
    backgroundColor: state.isSelected ? "var(--primary-color)" : "var(--text-color)",
    "&:hover": {
      backgroundColor: state.isSelected
        ? "var(--primary-color)"
        : "rgba(var(--background-color-rgb), 0.5)",
    },
    fontSize: "var(--font-size-small)",
    fontWeight: "normal",
    textAlign: "center",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--text-color)",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    display: "none",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
};

const PlayerPage = () => {
  const { mediaType, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryParams = new URLSearchParams(location.search);
  const [playerList, setPlayerList] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(1); // vidsrc.to
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [searchedEpisode, setSearchedEpisode] = useState("");
  const currentEmbedUrl = playerList && playerList[playerIndex];
  const swiperEpListRef = useRef(null);
  const options = playerList.map((player, index) => ({
    value: index,
    label: player.player,
  }));

  let season = null;
  let episode = null;

  if (mediaType === "tv") {
    season = queryParams.get("s");
    episode = queryParams.get("ep");
    if (!season) {
      season = "1";
    }
    if (!episode) {
      episode = "1";
    }

    queryParams.set("s", season);
    queryParams.set("ep", episode);
    window.history.replaceState({}, "", "?" + queryParams.toString());
  } else if (mediaType === "movie") {
    season = null;
    episode = null;
    queryParams.delete("s");
    queryParams.delete("ep");
    window.history.replaceState({}, "", "?" + queryParams.toString());
  }

  const handleEpisodeClick = (episodeNumber) => {
    if (activeEpisode === episodeNumber) {
      return;
    }
    navigate(`${location.pathname}?s=${season}&ep=${episodeNumber}`);
    setActiveEpisode(episodeNumber);
  };

  const handlePlayerChange = (selectedOption) => {
    setPlayerIndex(selectedOption.value);
  };

  const epSearch = (e) => {
    // reset the background color of the previous active episode card
    const prevSearchedEpisode = document.querySelector(
      `.${styles.episodeCard}[data-episode-number='${searchedEpisode}']`
    );
    if (prevSearchedEpisode && !prevSearchedEpisode.classList.contains(styles.active)) {
      prevSearchedEpisode.style.backgroundColor = "transparent";
    }

    if (e.target.value === "" || e.target.value === "e") {
      setSearchedEpisode("");
    } else if (e.target.value < 1) {
      return setSearchedEpisode("1");
    } else if (e.target.value > details.episodes.length) {
      return setSearchedEpisode(details.episodes.length.toString());
    } else {
      setSearchedEpisode(e.target.value);
    }
    if (e.target.value !== "" && swiperEpListRef.current) {
      const episodeNumber = parseInt(e.target.value);
      const episodeIndex = details.episodes.findIndex((ep) => ep.episode_number === episodeNumber);
      if (episodeIndex !== -1) {
        swiperEpListRef.current.slideTo(episodeIndex);
        const episodeCard = document.querySelector(
          `.${styles.episodeCard}[data-episode-number='${episodeNumber}']`
        );
        if (episodeCard && !episodeCard.classList.contains(styles.active)) {
          episodeCard.style.backgroundColor = "var(--secondary-color)";
        }
      }
    }
  };

  const handleBlur = () => {
    setSearchedEpisode("");
  };

  const onSwiperEpList = (swiper) => {
    swiperEpListRef.current = swiper;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (activeEpisode !== null && mediaType === "tv") {
      const container = document.querySelector(`.${styles.episodesContainer}`);
      const episode = document.querySelector(
        `.${styles.episodeCard}[data-episode-number='${activeEpisode}']`
      );
      if (episode && container) {
        container.scrollTo({
          top: episode.offsetTop - container.offsetTop * 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeEpisode, mediaType]);

  useEffect(() => {
    setActiveEpisode(parseInt(episode));
  }, [episode]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await getShowDetails(id, mediaType, "images,similar");

      if (mediaType === "tv" && season) {
        const seasonDetails = await getSeasonDetails(id, season);
        if (seasonDetails) {
          details.season = seasonDetails;
          details.episodes = seasonDetails.episodes;
        }
      }

      if (!details || details.length === 0) {
        setDetails(404);
      } else {
        setDetails(details);
      }
    };

    fetchDetails();
  }, [id, mediaType, season]);

  useEffect(() => {
    const fetchPlayerList = async () => {
      const playerList = await getPlayersService(mediaType, id, season, episode);
      if (playerList) {
        setPlayerList(playerList);
        setIsLoading(false);
      }
    };

    fetchPlayerList();
  }, [details, season, episode, mediaType, id]);

  function formatRuntime(runtime) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (hours === 1 && minutes === 0) {
      return "60m";
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  if (!details) {
    return null;
  }

  if (details === 404) {
    return <PageNotFound />;
  }

  return (
    <section className={styles.playerPage}>
      <div className={styles.breadcrumbs}>
        <a href="/">Home</a>
        <span> • </span>
        <a href={`/${mediaType}/${id}`}>Watching {details?.title || details?.name}</a>
        {mediaType === "tv" ? (
          <>
            <span> • </span>
            <p>Season {season}</p>
          </>
        ) : null}
      </div>

      <div className={styles.flexContainer}>
        <div>
          <div
            className={mediaType === "movie" ? styles.playerContainerMovie : styles.playerContainer}
          >
            {isLoading ? (
              <InfinitySpin
                width="200"
                color="var(--primary-color)"
                ariaLabel="infinity-spin-loading"
              />
            ) : currentEmbedUrl ? (
              <iframe
                title={details?.title || details?.name}
                src={currentEmbedUrl.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
              />
            ) : (
              <p className={styles.playerContainerError}>No video found for this episode.</p>
            )}
          </div>
          <div className={styles.playerOptionsContainer}>
            <div className={styles.playerSelectContainer}>
              <TvIcon className={styles.tvIcon} />
              <Select
                value={options.find((option) => option.value === playerIndex)}
                onChange={handlePlayerChange}
                options={options}
                styles={customStyles}
                className={styles.playerSelect}
              />
              <ArrowRightIcon className={styles.arrowRightIcon} />
            </div>
            <button className={styles.alertBtn}>
              <AlertIcon className={styles.alertIcon} />
              <p>Report issue</p>
            </button>
          </div>
        </div>

        {mediaType === "tv" && details?.episodes && (
          <div className={styles.episodesContainer}>
            <input
              type="number"
              value={searchedEpisode}
              onChange={epSearch}
              onBlur={handleBlur}
              placeholder="Search Episode..."
              min="1"
              max={details?.episodes?.length ?? 1}
              onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
              className={styles.epSearch}
            />
            <Swiper
              modules={[Mousewheel, FreeMode]}
              onSwiper={onSwiperEpList}
              spaceBetween={7.5}
              direction={"vertical"}
              slidesPerView={"auto"}
              freeMode={true}
              mousewheel={true}
              className={styles.episodesList}
            >
              {details.episodes.map((episode, index) => (
                <SwiperSlide
                  key={index}
                  data-episode-number={episode.episode_number}
                  className={`${styles.episodeCard} ${
                    activeEpisode === episode.episode_number ? styles.active : ""
                  }`}
                  onClick={() => handleEpisodeClick(episode.episode_number)}
                >
                  <img
                    src={
                      episode.still_path
                        ? IMAGE_W300_URL + episode.still_path
                        : IMAGE_W300_URL + details.poster_path || details.backdrop_path
                    }
                    alt={episode.name}
                    className={styles.episodeCardImage}
                  />
                  <div className={styles.episodeCardInfo}>
                    <h4 className={styles.episodeCardTitle}>
                      {episode.episode_number}. {episode.name}
                    </h4>

                    <p className={styles.episodeCardSub}>
                      <span className={styles.episodeRating}>
                        {episode.vote_average ? episode.vote_average.toFixed(1) : "N/A"}
                      </span>
                      {new Date(episode.air_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className={styles.dot}> • </span>
                      <span className={styles.episodeRuntime}>
                        {formatRuntime(episode.runtime)}
                      </span>
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <div className={styles.divider}></div>

      <CommentSection showId={id} season={season} episode={episode} />
    </section>
  );
};

export default PlayerPage;
