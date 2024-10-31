import React from "react";

// Libraries
import { Link, useNavigate } from "react-router-dom";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Utils
import Truncate from "@utils/truncate";

// Assets
import { ReactComponent as DetailsIcon } from "@assets/icons/list-collapse-icon.svg";
import { ReactComponent as FilledPlayIcon } from "@assets/icons/circle-filled-play-icon.svg";
import { ReactComponent as ArrowLeftIcon } from "@assets/icons/chevron-left-icon.svg";
import { ReactComponent as ArrowRightIcon } from "@assets/icons/chevron-right-icon.svg";
import { ReactComponent as ArrowUpIcon } from "@assets/icons/chevron-up-icon.svg";
import { ReactComponent as ArrowDownIcon } from "@assets/icons/chevron-down-icon.svg";
import ShowPlaceholder from "@assets/images/show-placeholder.svg";

// Styles
import styles from "./upcomingAndAirSlider.module.css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

// Constants
import { IMAGE_W200_URL, IMAGE_W780_URL } from "@utils/constants";

const UpcomingAndAir = React.memo(
  ({ upcomingMovies, onTheAirSeries, inTheaters, genres, isMobile }) => {
    const navigate = useNavigate();
    const swiperUpcomingRef = React.useRef(null);
    const swiperInTheatersRef = React.useRef(null);
    const swiperOnTheAirRef = React.useRef(null);

    // Set swiper instance to ref
    const onSwiperUpcoming = (swiper) => {
      swiperUpcomingRef.current = swiper;
    };

    // Set swiper instance to ref
    const onSwiperInTheaters = (swiper) => {
      swiperInTheatersRef.current = swiper;
    };

    // Set swiper instance to ref
    const onSwiperOnTheAir = (swiper) => {
      swiperOnTheAirRef.current = swiper;
    };

    return (
      <section className={styles.upcomingAndAiringSection}>
        <div className={styles.upcoming}>
          <div className={styles.titleAndButton}>
            <h3>Upcoming</h3>
            <div className={styles.buttonContainer}>
              <div
                className={styles.arrowButtonLeft}
                onClick={() => swiperUpcomingRef.current?.slidePrev()}
              >
                <ArrowLeftIcon />
              </div>
              <div
                className={styles.arrowButtonRight}
                onClick={() => swiperUpcomingRef.current?.slideNext()}
              >
                <ArrowRightIcon />
              </div>
            </div>
          </div>

          <Swiper
            modules={[Mousewheel]}
            onSwiper={onSwiperUpcoming}
            spaceBetween={isMobile ? 10 : 15}
            direction={"horizontal"}
            slidesPerView={1}
            loop={true}
            mousewheel={false}
            className={styles.upcomingContentContainer}
          >
            {upcomingMovies.map((item, index) => (
              <SwiperSlide key={index} className={styles.upcomingContent}>
                <Link to={`/movie/${item.id}`}>
                  <img
                    className={styles.upcomingImage}
                    src={
                      item.backdrop_path || item.poster_path
                        ? `${IMAGE_W780_URL}${item.backdrop_path || item.poster_path}`
                        : ShowPlaceholder
                    }
                    alt={item.title}
                    loading="lazy"
                  />
                </Link>
                <p className={styles.upcomingDate}>
                  {new Date(item.release_date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h4 className={styles.upcomingTitle}>{item.title}</h4>
                <p className={styles.upcomingGenres}>
                  {item.genre_ids
                    .map((genreId) => genres.movie?.find((genre) => genre.id === genreId)?.name)
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className={styles.upcomingOverview}>
                  <Truncate
                    str={item.overview}
                    num={isMobile ? 150 : 275}
                    id={item.id}
                    styles={styles}
                  />
                </p>
                <div className={styles.upcomingButtons}>
                  <button onClick={() => navigate(`/watch/movie/${item.id}`)}>
                    <FilledPlayIcon />
                    Watch Now
                  </button>
                  <button onClick={() => navigate(`/movie/${item.id}`)}>
                    <DetailsIcon />
                    More Details
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {!isMobile && (
          <>
            <div className={styles.airingSeries}>
              <div className={styles.titleAndButton}>
                <h3>Airing Series</h3>
                <div className={styles.buttonContainer}>
                  <div
                    className={styles.arrowButtonTop}
                    onClick={() => swiperOnTheAirRef.current?.slidePrev()}
                  >
                    <ArrowUpIcon />
                  </div>
                  <div
                    className={styles.arrowButtonBottom}
                    onClick={() => swiperOnTheAirRef.current?.slideNext()}
                  >
                    <ArrowDownIcon />
                  </div>
                </div>
              </div>

              <Swiper
                modules={[Mousewheel, FreeMode]}
                onSwiper={onSwiperOnTheAir}
                spaceBetween={15}
                direction={"vertical"}
                slidesPerView={"auto"}
                freeMode={true}
                loop={true}
                mousewheel={false}
                className={styles.airingContentContainer}
              >
                {onTheAirSeries.map((item, index) => (
                  <SwiperSlide key={index} className={styles.airingContent}>
                    <Link to={`/tv/${item.id}`} className={styles.airingContent}>
                      <img
                        src={
                          item.backdrop_path || item.poster_path
                            ? `${IMAGE_W200_URL}${item.poster_path || item.backdrop_path}`
                            : ShowPlaceholder
                        }
                        className={styles.airingImage}
                        alt="poster"
                        loading="lazy"
                      />
                      <div className={styles.airingDetails}>
                        <h5>{item.name}</h5>
                        <p className={styles.airingGenres}>
                          {item.genre_ids
                            .map(
                              (genreId) => genres.tv?.find((genre) => genre.id === genreId)?.name
                            )
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        <p className={styles.airingRating}>
                          <span>★ </span>
                          {item.vote_average.toFixed(1)}
                        </p>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className={styles.inTheaters}>
              <div className={styles.titleAndButton}>
                <h3>In Theaters</h3>
                <div className={styles.buttonContainer}>
                  <div
                    className={styles.arrowButtonTop}
                    onClick={() => swiperInTheatersRef.current?.slidePrev()}
                  >
                    <ArrowUpIcon />
                  </div>
                  <div
                    className={styles.arrowButtonBottom}
                    onClick={() => swiperInTheatersRef.current?.slideNext()}
                  >
                    <ArrowDownIcon />
                  </div>
                </div>
              </div>

              <Swiper
                modules={[Mousewheel, FreeMode]}
                onSwiper={onSwiperInTheaters}
                spaceBetween={15}
                direction={"vertical"}
                slidesPerView={"auto"}
                freeMode={true}
                loop={true}
                mousewheel={false}
                className={styles.inTheatersContentContainer}
              >
                {inTheaters.map((item, index) => (
                  <SwiperSlide key={index} className={styles.inTheatersContent}>
                    <Link to={`/movie/${item.id}`}>
                      <img
                        src={
                          item.backdrop_path || item.poster_path
                            ? `${IMAGE_W200_URL}${item.poster_path || item.backdrop_path}`
                            : ShowPlaceholder
                        }
                        className={styles.inTheatersImage}
                        alt={item.title}
                        loading="lazy"
                      />
                      <div className={styles.inTheatersDetails}>
                        <h5>{item.title}</h5>
                        <p className={styles.inTheatersGenres}>
                          {item.genre_ids
                            .map(
                              (genreId) => genres.movie?.find((genre) => genre.id === genreId)?.name
                            )
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        <p className={styles.inTheatersRating}>
                          <span>★ </span>
                          {item.vote_average.toFixed(1)}
                        </p>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
      </section>
    );
  }
);

export default UpcomingAndAir;
