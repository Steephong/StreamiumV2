import React from "react";

// Libraries
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Components
import ShowCard from "@components/ShowCard/ShowCard";

// Assets
import { ReactComponent as ArrowLeftIcon } from "@assets/icons/chevron-left-icon.svg";
import { ReactComponent as ArrowRightIcon } from "@assets/icons/chevron-right-icon.svg";

// Styles
import styles from "./popularShowsSlider.module.css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

const PopularShowsSlider = React.memo(({ popularShows, genres, showType, isMobile }) => {
  const swiperRef = React.useRef(null);

  // Set swiper instance to ref
  const onSwiper = (swiper) => {
    swiperRef.current = swiper;
  };

  return (
    <section className={styles.popularShows}>
      <h3>{showType === "movie" ? "Movies" : "Series"}</h3>
      <Swiper
        modules={[FreeMode, Mousewheel]}
        onSwiper={onSwiper}
        spaceBetween={isMobile ? 10 : 15}
        direction={"horizontal"}
        slidesPerView={"auto"}
        freeMode={true}
        mousewheel={false}
        className={styles.popularShowsContent}
      >
        {popularShows.map((item, index) => (
          <SwiperSlide key={index} className={styles.popularShowsItem}>
            <ShowCard item={item} genres={genres} showType={showType} />
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

export default PopularShowsSlider;
