import React, { createContext, useState, useEffect, useContext } from "react";

// Create context for isMobile
const IsMobileContext = createContext();

// Custom hook to use the isMobile context
export const IsMobileProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 960px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 960px)");

    // Initial check
    setIsMobile(mediaQuery.matches);

    // Function to handle changes
    const handleWindowResize = (e) => {
      setIsMobile(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleWindowResize);

    // Clean up listener
    return () => {
      mediaQuery.removeEventListener("change", handleWindowResize);
    };
  }, []);

  return <IsMobileContext.Provider value={{ isMobile }}>{children}</IsMobileContext.Provider>;
};

export const useIsMobile = () => {
  const context = useContext(IsMobileContext);
  if (!context) {
    throw new Error("useIsMobile must be used within an IsMobileProvider");
  }
  return context;
};
