import React, { useState, useEffect, useContext, createContext } from "react";

// Firebase SDK
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Storage SDK
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firestore SDK
import {
  getFirestore,
  collection,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  increment,
} from "firebase/firestore";

// Firebase configuration
import firebaseConfig from "@config/firebaseConfig";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);
const firestore = getFirestore(firebaseApp);

// Create context for authentication
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Firebase authentication state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, ...userData });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  // Signup function
  const signup = async (displayName, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Set user document in Firestore with additional data
      const userRef = doc(firestore, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid, // Add user ID from Firebase Auth
        displayName,
        email,
        photoURL: "",
        watchlist: {}, // Initialize watchlist as an empty object
        createdAt: serverTimestamp(), // Use server timestamp for creation time
      });

      return userCredential;
    } catch (error) {
      console.error("Error signing up or adding document to Firestore:", error);
      throw error;
    }
  };

  // Upload profile picture function
  const uploadProfilePicture = async (file) => {
    try {
      const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw error;
    }
  };

  const signupWithProfile = async (displayName, profilePictureFile, email, password) => {
    try {
      // Create user (ensure your signup function returns a promise)
      const userCredential = await signup(displayName, email, password);

      // Now wait for the user document to be created in Firestore
      const userRef = doc(firestore, "users", userCredential.user.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        console.log("User document created:", docSnapshot.data());
      } else {
        console.log("User document not found");
      }

      // Upload profile picture if provided
      if (profilePictureFile) {
        const profilePictureURL = await uploadProfilePicture(profilePictureFile);

        // Update user document with profile picture URL
        await updateDoc(userRef, { photoURL: profilePictureURL });

        // Update currentUser with the new photoURL
        await updateProfile(userCredential.user, { photoURL: profilePictureURL });

        // Manually update currentUser state
        setCurrentUser((prevUser) => ({
          ...prevUser,
          photoURL: profilePictureURL,
        }));
      }

      return userCredential; // Return the user credential object
    } catch (error) {
      // Handle signup errors (optional)
      console.error("Error signing up with profile:", error);
      throw error; // Re-throw for further handling
    }
  };

  // Check if displayName or email is already used
  const checkdisplayNameAndEmail = async (displayName, email, step) => {
    const usersRef = collection(firestore, "users");

    // Check if displayName is provided in step 1
    if (step === 1 && (!displayName || displayName === "")) {
      throw new Error("Username is required");
    } else if (step === 1 && displayName.length < 3) {
      throw new Error("Username must be at least 3 characters");
    } else if (step === 1 && displayName.length > 20) {
      throw new Error("Username must be at most 20 characters");
    } else if (step === 1 && !/^[a-zA-Z0-9_.-]*$/.test(displayName)) {
      throw new Error("Username can only contain letters, numbers, and symbols . - _");
    } else if (step === 1 && /\s/.test(displayName)) {
      throw new Error("Username cannot contain spaces");
    }

    // Check if email is provided in step 2
    if (step === 2 && (!email || email === "")) {
      throw new Error("Email is required");
    } else if (step === 2 && !/\S+@\S+\.\S+/.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check if displayName is already used
    const displayNameSnapshot = await getDocs(
      query(usersRef, where("displayName", "==", displayName))
    );
    if (!displayNameSnapshot.empty) {
      throw new Error("Username is already used");
    }

    // Check if email is already used
    const emailSnapshot = await getDocs(query(usersRef, where("email", "==", email)));
    if (!emailSnapshot.empty) {
      throw new Error("Email is already used");
    }
  };

  // Logout function
  const logout = async () => {
    await auth.signOut();
  };

  // Update user watchlist
  const AddToWatchlist = async (showId) => {
    const userRef = doc(firestore, "users", auth.currentUser.uid);
    // watchlist is zn object with a lastupdated timestamp and a list of showIds
    await updateDoc(userRef, {
      watchlist: {
        [showId]: serverTimestamp(),
      },
    });
  };

  // Add comment to show
  const AddComment = async (
    showId,
    season = null,
    episode = null,
    content,
    parentCommentId = null,
    mentionedUserId = null,
    isSpoiler = false
  ) => {
    const commentRef = collection(firestore, "comments");
    const commentId = doc(commentRef).id; // Generate a new comment ID

    await setDoc(doc(commentRef, commentId), {
      userId: auth.currentUser.uid, // Add user ID from Firebase Auth
      createdAt: serverTimestamp(), // Use server timestamp for creation time
      showId,
      season,
      episode,
      content,
      likes: 0, // Initialize likes as 0
      dislikes: 0, // Initialize dislikes as 0
      parentCommentId,
      mentionedUserId,
      isSpoiler,
      isDeleted: false, // Initialize isDeleted as false
      isEdited: false, // Initialize isEdited as false
      reactions: {}, // Initialize reactions as an empty object
      reports: {}, // Initialize reports as an empty object
    });
  };

  // Remove comment from show (soft delete so i don't have to handle cascade delete)
  const RemoveComment = async (commentId) => {
    const commentRef = doc(firestore, "comments", commentId);
    await updateDoc(commentRef, { isDeleted: true });
  };

  // Edit comment content
  const EditComment = async (commentId, newContent) => {
    const commentRef = doc(firestore, "comments", commentId);
    await updateDoc(commentRef, { content: newContent, isEdited: true });
  };

  // Reports comment
  const ReportComment = async (commentId, reason) => {
    const userId = auth.currentUser.uid;
    const commentRef = doc(firestore, "comments", commentId);

    await updateDoc(commentRef, {
      [`reports.${userId}`]: {
        reportedBy: userId,
        reason: reason,
        createdAt: serverTimestamp(),
      },
    });
  };

  const FetchComments = async (showId, season = null, episode = null) => {
    const commentsRef = collection(firestore, "comments");

    // Vérifiez si la collection existe
    const collectionSnapshot = await getDocs(commentsRef);
    if (collectionSnapshot.empty) {
      // Si la collection n'existe pas, retournez un tableau vide
      return [];
    }

    let commentsQuery = query(commentsRef, where("showId", "==", showId));

    if (season && episode) {
      commentsQuery = query(
        commentsRef,
        where("showId", "==", showId),
        where("season", "==", season),
        where("episode", "==", episode)
      );
    }

    const commentsSnapshot = await getDocs(commentsQuery);

    if (commentsSnapshot.empty) {
      // Si la collection est vide, retournez un tableau vide
      return [];
    }

    // Récupérez tous les userIds uniques
    const userIds = [...new Set(commentsSnapshot.docs.map((doc) => doc.data().userId))];

    // Récupérez les données de tous les utilisateurs en une seule fois
    const usersRef = collection(firestore, "users");
    const usersQuery = query(usersRef, where("uid", "in", userIds));
    const usersSnapshot = await getDocs(usersQuery);
    const usersData = usersSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    let comments = [];
    commentsSnapshot.forEach((doc) => {
      const commentData = doc.data();
      comments.push({
        id: doc.id,
        user: usersData[commentData.userId],
        ...commentData,
      });
    });

    return comments;
  };

  // Update comment reactions (like or dislike)
  const AddReaction = async (commentId, reactionType) => {
    const userId = auth.currentUser.uid;
    const commentRef = doc(firestore, "comments", commentId);

    await runTransaction(firestore, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error("Comment does not exist!");
      }

      const currentReactions = commentDoc.data().reactions || {};
      const previousReactionType = currentReactions[userId];

      // If the user has already reacted with the same reaction, remove the reaction
      if (previousReactionType && previousReactionType === reactionType) {
        // Prepare updates
        let updates = {
          [`reactions.${userId}`]: null,
          [reactionType === "like" ? "likes" : "dislikes"]: increment(-1),
        };

        transaction.update(commentRef, updates);
      }
      // If the user has already reacted with a different reaction, replace the reaction
      else if (previousReactionType && previousReactionType !== reactionType) {
        // Prepare updates
        let updates = {
          [`reactions.${userId}`]: reactionType,
          [reactionType === "like" ? "likes" : "dislikes"]: increment(1),
          [previousReactionType === "like" ? "likes" : "dislikes"]: increment(-1),
        };

        transaction.update(commentRef, updates);
      } else if (!previousReactionType) {
        // If the user has not reacted before, add the reaction
        let updates = {
          [`reactions.${userId}`]: reactionType,
          [reactionType === "like" ? "likes" : "dislikes"]: increment(1),
        };

        transaction.update(commentRef, updates);
      }
    });
  };

  // Get reaction of a specific user to a comment
  const getReaction = async (commentId, userId) => {
    const commentRef = doc(firestore, "comments", commentId);
    const commentDoc = await getDoc(commentRef);

    if (commentDoc.exists()) {
      const commentData = commentDoc.data();
      const reactions = commentData.reactions || {};
      return reactions[userId];
    } else {
      throw new Error("Comment does not exist!");
    }
  };

  // Get user data
  const getUserData = async (uid) => {
    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        username: userData.displayName,
        profilePic: userData.photoURL,
      };
    } else {
      throw new Error("User not found");
    }
  };

  const value = {
    currentUser,
    AddToWatchlist,
    AddComment,
    AddReaction,
    signupWithProfile,
    checkdisplayNameAndEmail,
    logout,
    EditComment,
    RemoveComment,
    ReportComment,
    FetchComments,
    getUserData,
    getReaction,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
