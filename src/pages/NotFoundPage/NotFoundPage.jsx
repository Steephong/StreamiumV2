import React from "react";

// Styles
import styles from "./notFoundPage.module.css";

const PageNotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1>Page Not Found</h1>
      <h2>
        <span className={styles.bounce}>4</span>
        <span className={styles.bounce}>0</span>
        <span className={styles.bounce}>4</span>
      </h2>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Home</a>
    </div>
  );
};

export default PageNotFound;
