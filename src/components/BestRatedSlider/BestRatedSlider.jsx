import React from "react";

// Libraries
import { Link } from "react-router-dom";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Assets
import { ReactComponent as ArrowLeftIcon } from "@assets/icons/chevron-left-icon.svg";
import { ReactComponent as ArrowRightIcon } from "@assets/icons/chevron-right-icon.svg";
import ShowPlaceholder from "@assets/images/show-placeholder.svg";

// Styles
import styles from "./bestRatedSlider.module.css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

// Constants
import { IMAGE_W200_URL } from "@utils/constants";

const BestRatedSlider = React.memo(({ bestRatedShows, genres, isMobile }) => {
  const swiperRef = React.useRef(null);

  // Set swiper instance to ref
  const onSwiper = (swiper) => {
    swiperRef.current = swiper;
  };

  return (
    <section className={styles.bestRatedShowsCarousel}>
      <h3>Best Rated</h3>
      <Swiper
        modules={[FreeMode, Mousewheel]}
        onSwiper={onSwiper}
        spaceBetween={isMobile ? 10 : 15}
        direction={"horizontal"}
        slidesPerView={"auto"}
        freeMode={true}
        mousewheel={false}
        className={styles.bestRatedShowsCarouselContent}
      >
        {bestRatedShows.map((item, index) => (
          <SwiperSlide key={index} className={styles.bestRatedShowsCarouselItem}>
            <Link to={`/${item.media_type}/${item.id}`}>
              <h4 className={styles.index}>{index + 1}</h4>
              <img
                src={
                  item.backdrop_path || item.poster_path
                    ? `${IMAGE_W200_URL}${item.poster_path || item.backdrop_path}`
                    : ShowPlaceholder
                }
                className={styles.bestRatedShowsCarouselImage}
                alt={item.title}
                loading="lazy"
              />
              <div className={styles.details}>
                <p className={styles.Year}>
                  {new Date(item.release_date || item.first_air_date).getFullYear()}
                </p>
                <h4 className={styles.title}>{item.title || item.name}</h4>
                <p className={styles.Genres}>
                  {item.genre_ids
                    .map(
                      (genreId) =>
                        genres[item.media_type]?.find((genre) => genre.id === genreId)?.name
                    )
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className={styles.rating}>
                  <span>★ </span>
                  {item.vote_average.toFixed(1)}
                  <span> | {item.media_type}</span>
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      {!isMobile && (
        <div className={styles.buttonContainerAbove}>
          <div className={styles.arrowButtonLeft} onClick={() => swiperRef.current?.slidePrev()}>
            <ArrowLeftIcon />
          </div>
          <div className={styles.arrowButtonRight} onClick={() => swiperRef.current?.slideNext()}>
            <ArrowRightIcon />
          </div>
        </div>
      )}
    </section>
  );
});

export default BestRatedSlider;
