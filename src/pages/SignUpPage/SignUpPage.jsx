import React, { useState, useRef } from "react";

// Libraries
import AvatarEditor from "react-avatar-editor";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

// Assets
import { ReactComponent as AddImage } from "@assets/icons/add-image-icon.svg";
import { ReactComponent as EditIcon } from "@assets/icons/edit-icon.svg";
import { ReactComponent as UserIcon } from "@assets/icons/user-icon.svg";
import { ReactComponent as EmailIcon } from "@assets/icons/email-icon.svg";
import { ReactComponent as PasswordIcon } from "@assets/icons/password-icon.svg";
import { ReactComponent as EyeIcon } from "@assets/icons/eye-icon.svg";
import { ReactComponent as EyeOffIcon } from "@assets/icons/eye-off-icon.svg";

// Contexts
import { useAuth } from "@contexts/AuthContext";

// Styles
import styles from "./signUpPage.module.css";

const SignupPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { signupWithProfile, checkdisplayNameAndEmail } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [originalProfilePictureFile, setOriginalProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const editorRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [overlayProfilePicture, setOverlayProfilePicture] = useState(false);

  // If user is already logged in, redirect to home page
  if (currentUser) {
    navigate("/");
  }

  // Function to handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setOriginalProfilePictureFile(file); // Store the original file
      setProfilePicturePreview(URL.createObjectURL(file));
      setShowEditor(true); // Show editor by default
    }
  };

  // Function to handle zoom change
  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value));
  };

  // Function to handle next step in form
  const handleNext = async (e) => {
    e.preventDefault();

    if (step === 1) {
      // Validate display name
      try {
        await checkdisplayNameAndEmail(displayName, null, 1);
      } catch (error) {
        setErrors({ displayName: error.message });
        return;
      }

      // Proceed to step 2
      setStep(2);
    } else {
      // Step 2: Perform signup
      try {
        await checkdisplayNameAndEmail(null, email, 2);
      } catch (error) {
        setErrors({ email: error.message });
        return;
      }

      if (!password) {
        setErrors({ password: "Password is required" });
        return;
      } else if (password.length < 6) {
        setErrors({ password: "Password must be at least 6 characters" });
        return;
      } else if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      try {
        await signupWithProfile(displayName, profilePictureFile, email, password);
        // Navigate to home page or any desired route upon successful signup
        navigate("/");
      } catch (error) {
        setErrors({ general: error.message });
      }
    }
  };

  // Function to handle input change
  const handleInputChange = (e, field) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: null, // Clear error when user starts typing
    }));

    switch (field) {
      case "displayName":
        setDisplayName(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
      case "password":
        setPassword(e.target.value);
        break;
      case "confirmPassword":
        setConfirmPassword(e.target.value);
        break;
      default:
        break;
    }
  };

  // Function to handle previous step
  const handlePrev = (e) => {
    e.preventDefault();
    setStep(1);
  };

  // Function to save profile picture
  const handleSaveProfilePicture = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImage();
      const dataURL = canvas.toDataURL();
      setProfilePicturePreview(dataURL); // Update preview
      canvas.toBlob((blob) => {
        setProfilePictureFile(blob);
      });
    }
    setShowEditor(false); // Hide editor
  };

  return (
    <section className={styles.section}>
      <h1 className={styles.branding}>Streamium</h1>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Create
          <br />
          an
          <br />
          account
        </h2>
        <form onSubmit={handleNext} className={styles.formContainer}>
          <h2 className={styles.formTitle}>Signup</h2>
          {/* Step 1: displayName and Profile Picture */}
          {step === 1 && (
            <>
              <div>
                <div className={styles.profilePicture}>
                  {profilePicturePreview ? (
                    <>
                      <img
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className={styles.profileImage}
                        onMouseOver={() => setOverlayProfilePicture(true)}
                        onMouseOut={() => setOverlayProfilePicture(false)}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("profilePictureInput").click();
                        }}
                      />
                      {overlayProfilePicture && (
                        <div className={styles.overlayProfilePicture}>
                          <p>Click to change</p>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowEditor(true); // Show editor on edit click
                        }}
                        className={styles.editButton}
                      >
                        <EditIcon />
                        Edit
                      </button>
                    </>
                  ) : (
                    <div className={styles.profileImage}>
                      <AddImage
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("profilePictureInput").click();
                        }}
                      />
                    </div>
                  )}
                </div>
                <input
                  id="profilePictureInput"
                  className={styles.inputHidden}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className={styles.inputContainer}>
                <UserIcon className={styles.icons} />
                <input
                  type="input"
                  className={styles.formField}
                  placeholder="Username"
                  name="username"
                  id="username"
                  value={displayName}
                  onChange={(e) => handleInputChange(e, "displayName")}
                  required
                />
                <label htmlFor="username" className={styles.formLabel}>
                  Username
                </label>
              </div>
              {errors.displayName && <p className={styles.error}>{errors.displayName}</p>}
            </>
          )}

          {/* Step 2: Email and Password */}
          {step === 2 && (
            <div>
              <div className={styles.inputContainer}>
                <EmailIcon className={styles.icons} />
                <input
                  type="email"
                  className={styles.formField}
                  placeholder="Email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => handleInputChange(e, "email")}
                />
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
              </div>
              {errors.email && <p className={styles.error}>{errors.email}</p>}
              <div className={styles.inputContainer}>
                <PasswordIcon className={styles.icons} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.formField}
                  placeholder="Password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => handleInputChange(e, "password")}
                  required
                />
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <button
                  className={styles.eyeIcon}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((prevShowPassword) => !prevShowPassword);
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className={styles.error}>{errors.password}</p>}

              <div className={styles.inputContainer}>
                <PasswordIcon className={styles.icons} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={styles.formField}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange(e, "confirmPassword")}
                  required
                />
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Confirm Password
                </label>
                <button
                  className={styles.eyeIcon}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
                  }}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
            </div>
          )}

          <div>
            {step !== 1 && (
              <button onClick={handlePrev} className={styles.prevBTN}>
                Previous
              </button>
            )}

            <button type="submit" className={styles.submitBTN}>
              {step === 1 ? "Next" : "Signup"}
            </button>
          </div>
        </form>
      </div>

      {/* Avatar Editor */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onRequestClose={() => setShowEditor(false)}
          contentLabel="Avatar Editor"
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <AvatarEditor
            ref={editorRef}
            image={URL.createObjectURL(originalProfilePictureFile)}
            width={300}
            height={300}
            border={0}
            borderRadius={200}
            scale={zoom}
          />
          <div>
            <label htmlFor="zoom" style={{ display: "block", marginBottom: "10px" }}>
              Zoom: {zoom}
            </label>
            <div className={styles.zoomControl}>
              <input
                id="zoom"
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={handleZoomChange}
                className={styles.zoomSlider}
              />
              <div
                style={{ width: `${((zoom - 0.9) / 2) * 100}%` }}
                className={styles.zoomBar}
              ></div>
            </div>
          </div>
          <div className={styles.modalButtons}>
            <button onClick={handleSaveProfilePicture} className={styles.saveBTN}>
              Save
            </button>
            <button onClick={() => setShowEditor(false)} className={styles.cancelBTN}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {errors.general && <p className={styles.error}>{errors.general}</p>}
    </section>
  );
};

export default SignupPage;
