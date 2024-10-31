import React, { useState, useEffect, useRef } from "react";

// Libraries
import { useLocation } from "react-router-dom";

// Services
import { search } from "@services/tmdbService";

// Assets
import { ReactComponent as SearchIcon } from "@assets/icons/search-icon.svg";
import { ReactComponent as BellIcon } from "@assets/icons/bell-icon.svg";
import { ReactComponent as UserPlaceholder } from "@assets/icons/user-icon.svg";
import { ReactComponent as ArrowDown } from "@assets/icons/chevron-down-icon.svg";
import { ReactComponent as Menu } from "@assets/icons/menu-icon.svg";
import { ReactComponent as Close } from "@assets/icons/x-icon.svg";

// Contexts
import { useIsMobile } from "@contexts/IsMobileContext";
import { useAuth } from "@contexts/AuthContext";

// Styles
import styles from "./navbar.module.css";

const Navbar = ({ setSearchResults, setSearchQuery }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const timeoutId = useRef(null);
  const { isMobile } = useIsMobile();
  const [menuOpened, setMenuOpened] = useState(false);
  const menuBurgerRef = useRef(null);
  const [profileMenuOpened, setProfileMenuOpened] = useState(false);
  const profileMenuRef = useRef(null);

  const handleSearchIconClick = () => {
    document.querySelector(`.${styles.searchBar} input`).focus();
  };

  const handleMenuBurgerClick = () => {
    if (menuBurgerRef.current.classList.contains(styles.active) || menuOpened) {
      setMenuOpened(false);
    } else {
      setMenuOpened(true);
    }
  };

  const handleProfileClick = () => {
    if (profileMenuRef.current.classList.contains(styles.active) || profileMenuOpened) {
      setProfileMenuOpened(false);
    } else {
      setProfileMenuOpened(true);
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.trim().toLowerCase();
    setSearchQuery(searchValue);

    if (searchValue === "") {
      setSearchResults([]);
      return;
    }

    if (searchValue.length < 3 || searchValue === "") {
      setSearchResults([]);
      return;
    }

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      search(searchValue).then((data) => {
        setSearchResults(data);
      });
    }, 500);
  };

  useEffect(() => {
    if (menuOpened) {
      menuBurgerRef.current?.classList.add(styles.active);
      document.body.style.overflow = "hidden"; // disable scroll
    } else {
      menuBurgerRef.current?.classList.remove(styles.active);
      document.body.style.overflow = "auto"; // enable scroll
    }
  }, [menuOpened]);

  useEffect(() => {
    if (profileMenuOpened) {
      profileMenuRef.current?.classList.add(styles.active);
      console.log("profileMenuOpened");
    } else {
      profileMenuRef.current?.classList.remove(styles.active);
      console.log("profileMenuClosed");
    }
  }, [profileMenuOpened]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        document.querySelector(`.${styles.searchBar} input`).value = "";
        document.querySelector(`.${styles.searchBar} input`).blur();
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    window.addEventListener("keydown", handleEsc);

    // Cleaning up
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [setSearchQuery, setSearchResults]);

  useEffect(() => {
    const searchInput = document.querySelector(`.${styles.searchBar} input`);
    if (searchInput) {
      searchInput.value = "";
      searchInput.blur();
    }
    setSearchQuery("");
    setSearchResults([]);
  }, [location, setSearchQuery, setSearchResults]);

  return (
    <nav className={styles.navbar}>
      {isMobile === false && (
        <ul className={styles.links}>
          <li>
            <a href="/" className={location.pathname === "/" ? styles.active : ""}>
              Home
            </a>
          </li>
          <li>
            <a href="/discover" className={location.pathname === "/discover" ? styles.active : ""}>
              Discover
            </a>
          </li>
          <li>
            <a href="/upcoming" className={location.pathname === "/upcoming" ? styles.active : ""}>
              Upcoming
            </a>
          </li>
          <li>
            <a href="/forum" className={location.pathname === "/forum" ? styles.active : ""}>
              Forum
            </a>
          </li>
          <li>
            <a href="/about" className={location.pathname === "/about" ? styles.active : ""}>
              About
            </a>
          </li>
        </ul>
      )}

      {isMobile === true && (
        <>
          <div className={styles.menuBurgerIcon} onClick={handleMenuBurgerClick}>
            {menuOpened ? <Close /> : <Menu />}
          </div>

          <div className={styles.menuBurger} ref={menuBurgerRef}>
            <div className={styles.menuBurgerHeader}>
              <h1 className={styles.branding}>Streamium</h1>
            </div>
            <ul className={styles.menuBurgerLinks}>
              <li>
                <a href="/" className={location.pathname === "/" ? styles.active : ""}>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/discover"
                  className={location.pathname === "/discover" ? styles.active : ""}
                >
                  Discover
                </a>
              </li>
              <li>
                <a
                  href="/upcoming"
                  className={location.pathname === "/upcoming" ? styles.active : ""}
                >
                  Upcoming
                </a>
              </li>
              <li>
                <a href="/forum" className={location.pathname === "/forum" ? styles.active : ""}>
                  Forum
                </a>
              </li>
              <li>
                <a href="/about" className={location.pathname === "/about" ? styles.active : ""}>
                  About
                </a>
              </li>
            </ul>
          </div>
        </>
      )}

      <h1 className={styles.branding}>Streamium</h1>

      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search ..." onChange={handleSearch} />
        </div>

        <div className={styles.searchIcon} onClick={handleSearchIconClick}>
          <SearchIcon />
        </div>

        {!isMobile && (
          <div className={styles.notifications}>
            <BellIcon />
          </div>
        )}

        {currentUser ? (
          <div className={styles.profile}>
            <div className={styles.profileClick} onClick={handleProfileClick}>
              {!isMobile && <p className={styles.displayName}>{currentUser.displayName || ""}</p>}
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className={styles.UserImage} />
              ) : (
                <UserPlaceholder className={styles.UserImage} />
              )}
              <ArrowDown className={styles.ArrowDown} />
            </div>
            <div className={styles.profileOptionsContainer} ref={profileMenuRef}>
              <ul className={styles.profileOptions}>
                <li>Account</li>
                <li>Settings</li>
                <li>Help</li>
                <li onClick={logout}>Logout</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className={styles.logContainer}>
            {!isMobile && window.location.pathname !== "/sign-up" && (
              <button
                className={styles.signupButton}
                onClick={() => (window.location.href = "/sign-up")}
              >
                Sign up
              </button>
            )}
            {window.location.pathname !== "/login" && (
              <button
                className={styles.loginButton}
                onClick={() => (window.location.href = "/login")}
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
