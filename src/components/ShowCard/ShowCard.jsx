import React from "react";

// Libraries
import { Link } from "react-router-dom";

// Images
import ShowPlaceholder from "@assets/images/show-placeholder.svg";

// Styles
import styles from "./showCard.module.css";

// Constants
import { IMAGE_W300_URL } from "@utils/constants";

const ShowCard = ({ item, genres, showType }) => (
  <Link to={`/${showType}/${item.id}`} className={styles.showCard}>
    <img
      src={
        item.backdrop_path || item.poster_path
          ? `${IMAGE_W300_URL}${item.backdrop_path || item.poster_path}`
          : ShowPlaceholder
      }
      className={styles.showCardImage}
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
            .map((genreId) => genres[showType]?.find((genre) => genre.id === genreId)?.name)
            .filter(Boolean)
            .slice(0, 3)
            .join(" • ")}
        </span>
      </p>
    </div>
  </Link>
);

export default ShowCard;
