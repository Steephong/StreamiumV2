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
import styles from "./trendingSlider.module.css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

// Constants
import { IMAGE_W500_URL } from "@utils/constants";

const TrendingSlider = React.memo(({ trendingDataWeek, genres, isMobile }) => {
  const swiperRef = React.useRef(null);

  // Set swiper instance to ref
  const onSwiper = (swiper) => {
    swiperRef.current = swiper;
  };

  return (
    <section className={styles.trendingCarousel}>
      <h3>Trending</h3>
      <Swiper
        modules={[FreeMode, Mousewheel]}
        onSwiper={onSwiper}
        spaceBetween={isMobile ? 10 : 15}
        direction={"horizontal"}
        slidesPerView={"auto"}
        freeMode={true}
        mousewheel={false}
        className={styles.trendingCarouselContent}
      >
        {trendingDataWeek.map((item, index) => (
          <SwiperSlide key={index} className={styles.trendingCarouselItem}>
            <Link to={`/${item.media_type}/${item.id}`}>
              <img
                src={
                  item.backdrop_path || item.poster_path
                    ? `${IMAGE_W500_URL}${item.poster_path || item.backdrop_path}`
                    : ShowPlaceholder
                }
                className={styles.trendingCarouselImage}
                alt={item.title || item.name}
                loading="lazy"
              />
              <div className={styles.details}>
                <h4>{item.title || item.name}</h4>
                <p>
                  <span>★ </span>
                  {item.vote_average.toFixed(1)}
                  <span>
                    {" "}
                    |{" "}
                    {item.genre_ids
                      .map(
                        (genreId) =>
                          genres[item.media_type]?.find((genre) => genre.id === genreId)?.name
                      )
                      .filter(Boolean)
                      .join(" • ")}
                  </span>
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      {!isMobile && (
        <div className={styles.buttonContainerAboveBig}>
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

export default TrendingSlider;
