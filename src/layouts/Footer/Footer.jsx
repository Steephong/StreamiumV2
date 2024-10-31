import React from "react";

// Assets
import { ReactComponent as DiscordIcon } from "@assets/icons/discord-icon.svg";
import { ReactComponent as TikTokIcon } from "@assets/icons/tiktok-icon.svg";
import { ReactComponent as TwitterIcon } from "@assets/icons/twitter-icon.svg";
import { ReactComponent as InstaIcon } from "@assets/icons/insta-icon.svg";

// Styles
import styles from "./footer.module.css";

function Footer() {
  return (
    <footer>
      <div className={styles.logosContainer}>
        <DiscordIcon />
        <TikTokIcon />
        <TwitterIcon />
        <InstaIcon />
      </div>
      <div className={styles.linksContainer}>
        <div>
          <a href="/">Legal Mentions</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>

        <div>
          <a href="/">FAQ</a>
          <a href="/">Technical Support</a>
          <a href="/">About Us</a>
        </div>

        <div>
          <a href="/">Home</a>
          <a href="/">Movies</a>
          <a href="/">TV Shows</a>
        </div>

        <div>
          <a href="/">Discover</a>
          <a href="/">Upcoming</a>
          <a href="/">Forum</a>
        </div>
      </div>

      <div className={styles.footerInfos}>
        <p>
          We do not host any copyrighted content on our servers. All media files and content linked
          on this website are hosted by third-party websites, we don't own or have any control over
          their content.
        </p>
        <p>© 2024 Streamium. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
