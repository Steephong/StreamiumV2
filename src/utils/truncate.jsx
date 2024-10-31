import React, { useState, useCallback } from "react";

// Libraries
import { useNavigate } from "react-router-dom";

/**
 * Truncate text and add read more/less functionality
 *
 * @param {string} str - The string to truncate
 * @param {number} num - The number of characters to truncate
 * @param {string} id - The id of the movie
 * @param {object} styles - The styles object
 *
 * @returns {JSX.Element} - The JSX element
 */

export default function Truncate({ str, num, id = undefined, styles }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleReadMoreClick = useCallback(() => {
    id ? navigate(`/movie/${id}`) : setIsExpanded(true);
  }, [id, navigate]);

  const handleReadLessClick = useCallback(() => {
    setIsExpanded(false);
  }, []);

  if (str.length <= num) {
    return str;
  }

  return (
    <span>
      {isExpanded ? str : str.slice(0, num)}
      <span
        className={styles.readMore}
        onClick={isExpanded ? handleReadLessClick : handleReadMoreClick}
      >
        {" "}
        {isExpanded ? "- Read less" : "...Read more"}
      </span>
    </span>
  );
}
