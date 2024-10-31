import React from "react";

// Components
import ShowCard from "@components/ShowCard/ShowCard";

// Styles
import styles from "./searchOverlay.module.css";

const SearchOverlay = ({ searchResults, genres }) => {
  const NumResFound =
    searchResults && searchResults.length !== 0 ? `${searchResults.length} +` : "No";

  return (
    <section className={styles.searchOverlayContainer}>
      <div className={styles.resultsContainer}>
        <div className={styles.resultItem}>
          <h1 className={styles.numResFound}>
            <span>{NumResFound}</span>
            <br />
            Results
            <br />
            found
          </h1>
        </div>
        {searchResults &&
          searchResults.map((item, index) => (
            <ShowCard item={item} genres={genres} showType={item.media_type} index={index} />
          ))}
      </div>
    </section>
  );
};

export default SearchOverlay;
