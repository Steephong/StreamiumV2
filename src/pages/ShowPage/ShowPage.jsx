import React, { useEffect, useState } from "react";

// Libraries
import { useParams, useNavigate, Link } from "react-router-dom";
import { FreeMode, Scrollbar, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Services
import { getShowDetails } from "@services/tmdbService";

// Components
import PageNotFound from "../NotFoundPage/NotFoundPage";

// Contexts
import { useIsMobile } from "@contexts/IsMobileContext";
import { useAuth } from "@contexts/AuthContext";

// Utils
import Truncate from "@utils/truncate";

// Icons
import { ReactComponent as BookmarkIcon } from "@assets/icons/bookmark-icon.svg";
import { ReactComponent as FilledPlayIcon } from "@assets/icons/circle-filled-play-icon.svg";
import { ReactComponent as PlayIcon } from "@assets/icons/circle-play-icon.svg";

// Images
import ShowPlaceholder from "@assets/images/show-placeholder.svg";

// Styles
import styles from "./showPage.module.css";
import "swiper/css/bundle";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

// Constants
import { IMAGE_OG_URL, IMAGE_W500_URL, IMAGE_W300_URL, YT_BASE_URL } from "@utils/constants";

const ShowDetails = ({ genres }) => {
  const { id, mediaType } = useParams();
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Seasons");
  const { isMobile } = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, mediaType]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await getShowDetails(id, mediaType, "credits,videos,similar");
      if (!details || details.length === 0) {
        setDetails(404);
        return;
      } else {
        setDetails(details);
      }
    };

    fetchDetails();
  }, [id, mediaType, navigate]);

  if (!details) {
    return null;
  }

  if (details === 404) {
    return <PageNotFound />;
  }

  return (
    <section className={styles.showDetailsContainer}>
      <div className={styles.detailsBackgroundImage}>
        <div className={styles.content}>
          <p className={styles.mediaType}>{mediaType === "tv" ? "Series" : "Movie"}</p>
          <h1>{details.title || details.name}</h1>
          <p className={styles.subDetails}>
            <span>
              {details.seasons && details.seasons.length
                ? `${details.number_of_seasons} Seasons`
                : `${details.runtime} min` || `${details.episode_run_time[0]} min`}
            </span>
            <span className={styles.dotSeparator}>•</span>
            <span>
              {new Date(details.release_date || details.first_air_date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                }
              )}
            </span>
            {details.genres && (
              <>
                <span className={styles.dotSeparator}>•</span>
                <span>{details.genres.map((genre) => genre.name).join(", ")}</span>
              </>
            )}
          </p>
          <div className={styles.mainPageButtons2}>
            <div>
              <button onClick={() => navigate(`/watch/${mediaType}/${details.id}`)}>
                <FilledPlayIcon />
                Watch Now
              </button>
              <button>
                <BookmarkIcon />
                Add Watchlist
              </button>
            </div>
            <button className={styles.lastBtn}>
              <PlayIcon />
              Watch Trailer
            </button>
          </div>
        </div>

        <img
          src={
            details.backdrop_path || details.poster_path
              ? `${IMAGE_OG_URL}${details.backdrop_path || details.poster_path}`
              : ShowPlaceholder
          }
          alt={details.title}
          loading="lazy"
        />
      </div>

      <div className={styles.storyLineMoreInfosContainer}>
        <div className={styles.storyLine}>
          <h2>Story Line</h2>
          <Truncate str={details.overview} num={isMobile ? 155 : 550} styles={styles} />
        </div>
        <div className={styles.moreInfos}>
          <h2>More Information</h2>
          <div>
            <p>
              <span>Original Language:</span> {details.original_language ?? "N/A"}
            </p>
            <p>
              <span>Production Companies:</span>{" "}
              {details.production_companies.map((company) => company.name).join(", ") || "N/A"}
            </p>
            <p>
              <span>Production Countries:</span>{" "}
              {details.production_countries.map((country) => country.name).join(", ") || "N/A"}
            </p>
            <p>
              <span>Status:</span> {details.status ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.listSelector}>
        <button
          className={activeButton === "Seasons" ? styles.active : ""}
          onClick={() => setActiveButton("Seasons")}
        >
          {details.seasons ? "Seasons" : "Movie"}
        </button>
        <button
          className={activeButton === "Cast" ? styles.active : ""}
          onClick={() => setActiveButton("Cast")}
        >
          Cast
        </button>
        <button
          className={activeButton === "Videos" ? styles.active : ""}
          onClick={() => setActiveButton("Videos")}
        >
          Videos
        </button>
      </div>

      <Swiper
        modules={[FreeMode, Scrollbar, Mousewheel]}
        spaceBetween={15}
        direction={"horizontal"}
        slidesPerView={"auto"}
        freeMode={true}
        scrollbar={{ draggable: true }}
        mousewheel={false}
        className={styles.listContent}
      >
        {activeButton === "Seasons" && (
          <>
            {details.seasons ? (
              details.seasons.map((season) => (
                <SwiperSlide key={season.id} className={styles.seasonCard}>
                  <Link to={`/watch/${mediaType}/${id}?s=${season.season_number}`}>
                    <img
                      src={
                        season.poster_path
                          ? `${IMAGE_W300_URL}${season.poster_path}`
                          : ShowPlaceholder
                      }
                      alt={season.name}
                      loading="lazy"
                    />
                    <div>
                      <h3>{season.name}</h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide className={styles.seasonCard}>
                <Link to={`/watch/${mediaType}/${id}`}>
                  <img
                    src={
                      details.poster_path
                        ? `${IMAGE_W300_URL}${details.poster_path}`
                        : ShowPlaceholder
                    }
                    alt={details.title || details.name}
                    loading="lazy"
                  />
                  <div>
                    <h3>Watch Now</h3>
                  </div>
                </Link>
              </SwiperSlide>
            )}
          </>
        )}
        {activeButton === "Cast" && (
          <>
            {details.credits.cast.map((cast) => (
              <SwiperSlide key={cast.id} className={styles.castCard}>
                <img
                  src={
                    cast.profile_path ? `${IMAGE_W300_URL}${cast.profile_path}` : ShowPlaceholder
                  }
                  alt={cast.name}
                  loading="lazy"
                />
                <div className={styles.castCardNames}>
                  <h3>{cast.name}</h3>
                  <p>{cast.character}</p>
                </div>
              </SwiperSlide>
            ))}
          </>
        )}
        {activeButton === "Videos" && (
          <>
            {details.videos.results.map((video) => (
              <SwiperSlide key={video.id} className={styles.videoCard}>
                <a href={`${YT_BASE_URL}${video.key}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/0.jpg`}
                    alt={video.name}
                    loading="lazy"
                  />
                </a>
                <h3>{video.name}</h3>
              </SwiperSlide>
            ))}
          </>
        )}
      </Swiper>
      {details.similar.results.length > 0 && (
        <>
          <div className={styles.divider}></div>
          <div className={styles.similarShows}>
            <h2>Similar Shows</h2>
            <Swiper
              modules={[FreeMode, Scrollbar, Mousewheel]}
              spaceBetween={15}
              direction={"horizontal"}
              slidesPerView={"auto"}
              freeMode={true}
              scrollbar={{ draggable: true }}
              mousewheel={false}
              className={styles.similarShowsContainer}
            >
              {details.similar.results.map((show) => (
                <SwiperSlide key={show.id} className={styles.similarShowCard}>
                  <Link to={`/${mediaType}/${show.id}`}>
                    <img
                      src={
                        show.backdrop_path || show.poster_path
                          ? `${IMAGE_W500_URL}${show.backdrop_path || show.poster_path}`
                          : ShowPlaceholder
                      }
                      alt={show.title || show.name}
                      loading="lazy"
                    />
                    <h4>{show.title || show.name}</h4>
                    <p>
                      <span>★ </span>
                      {show.vote_average ? show.vote_average.toFixed(1) : "N/A"}
                      <span>
                        {" "}
                        |{" "}
                        {show.genre_ids
                          ? show.media_type === "movie"
                            ? show.genre_ids
                                .map(
                                  (genreId) =>
                                    genres?.movie?.find((genre) => genre.id === genreId)?.name
                                )
                                .filter(Boolean)
                                .slice(0, 3)
                                .join(" • ")
                            : show.genre_ids
                                .map(
                                  (genreId) =>
                                    genres?.tv?.find((genre) => genre.id === genreId)?.name
                                )
                                .filter(Boolean)
                                .slice(0, 3)
                                .join(" • ")
                          : "N/A"}
                      </span>
                    </p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      )}
    </section>
  );
};

export default ShowDetails;
