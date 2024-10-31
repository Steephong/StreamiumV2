import React, { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@contexts/IsMobileContext";
import { useAuth } from "@contexts/AuthContext";
import { ReactComponent as UserPlaceholder } from "@assets/icons/user-icon.svg";
import { ReactComponent as SendIcon } from "@assets/icons/send-icon.svg";
import { ReactComponent as ReplyIcon } from "@assets/icons/reply-icon.svg";
import { ReactComponent as ThumbUpIcon } from "@assets/icons/thumb-up-icon.svg";
import { ReactComponent as ThumbDownIcon } from "@assets/icons/thumb-down-icon.svg";
import { ReactComponent as ReportIcon } from "@assets/icons/report-msg-icon.svg";
import { ReactComponent as CommentIcon } from "@assets/icons/comment-icon.svg";
import formatNumber from "@utils/formatNumbersK";
import styles from "./commentSection.module.css";

const CommentSection = ({ showId, season, episode }) => {
  const { currentUser, FetchComments, AddComment, AddReaction, getReaction, getUserData } =
    useAuth();
  const { isMobile } = useIsMobile();
  const [comments, setComments] = useState([]);
  const [commentsNumber, setCommentsNumber] = useState(0);
  const [clicked, setClicked] = useState({ like: false, dislike: false });
  const [parentId, setParentId] = useState(null);

  const fetchCommentsWithReactions = useCallback(
    async (season, episode) => {
      if (FetchComments) {
        try {
          const comments = await FetchComments(showId, season, episode);

          console.log("comments", comments);

          setCommentsNumber(comments.length || 0);

          const commentsWithUserReaction = await Promise.all(
            comments.map(async (comment) => {
              let userReaction = null;
              if (currentUser) {
                userReaction = await getReaction(comment.id, currentUser.uid);
              }
              return { ...comment, userReaction };
            })
          );

          const commentsWithReplies = commentsWithUserReaction.map((comment) => {
            const replies = commentsWithUserReaction
              .filter((c) => c.parentCommentId === comment.id)
              .sort((a, b) => b.createdAt - a.createdAt);
            return { ...comment, replies };
          });

          setComments(commentsWithReplies.filter((comment) => comment.parentCommentId === null));
        } catch (error) {
          console.error("Error fetching comments with reactions: ", error);
        }
      } else {
        console.error("FetchComments is not defined");
      }
    },
    [FetchComments, showId, currentUser, getReaction, season, episode]
  );

  useEffect(() => {
    fetchCommentsWithReactions(season, episode);
  }, [fetchCommentsWithReactions, season, episode]);

  const handleAddComment = async (e, parentCommentId = null, mentionedUserId = null) => {
    e.preventDefault();
    const comment = e.target.comment.value;
    if (AddComment) {
      try {
        await AddComment(showId, season, episode, comment, parentCommentId, mentionedUserId);
        await fetchCommentsWithReactions(season, episode);
        e.target.comment.value = "";
        setParentId(null);
      } catch (error) {
        console.error("Error adding or fetching comments: ", error);
      }
    }
  };

  const handleAddReaction = async (commentId, reaction) => {
    if (AddReaction && currentUser) {
      try {
        const updatedComments = [...comments];

        const updateCommentReaction = (commentList) => {
          for (let comment of commentList) {
            if (comment.id === commentId) {
              if (reaction === "like") {
                if (comment.userReaction === "like") {
                  comment.likes -= 1;
                  comment.userReaction = null;
                } else {
                  if (comment.userReaction === "dislike") {
                    comment.dislikes -= 1;
                  }
                  comment.likes += 1;
                  comment.userReaction = "like";
                }
              } else if (reaction === "dislike") {
                if (comment.userReaction === "dislike") {
                  comment.dislikes -= 1;
                  comment.userReaction = null;
                } else {
                  if (comment.userReaction === "like") {
                    comment.likes -= 1;
                  }
                  comment.dislikes += 1;
                  comment.userReaction = "dislike";
                }
              }
              break;
            }

            if (comment.replies && comment.replies.length > 0) {
              updateCommentReaction(comment.replies);
            }
          }
        };

        updateCommentReaction(updatedComments);

        setComments(updatedComments);
        setClicked({ ...clicked, [reaction]: commentId });

        await AddReaction(commentId, reaction);

        await fetchCommentsWithReactions(season, episode);
      } catch (error) {
        console.error("Error adding reaction: ", error);
        await fetchCommentsWithReactions(season, episode);
      } finally {
        setClicked({ ...clicked, [reaction]: null });
      }
    }
  };

  const Comment = ({ comment }) => {
    const parentComment = comment.parentCommentId
      ? comments.find((c) => c.id === comment.parentCommentId)
      : null;

    return (
      <div className={styles.comment}>
        <div className={styles.commentHeader}>
          <div className={styles.commentUser}>
            {comment.user && comment.user.photoURL ? (
              <img
                src={comment.user.photoURL}
                alt={comment.user.displayName}
                className={styles.commentUserAvatar}
              />
            ) : (
              <UserPlaceholder className={styles.commentUserAvatar} />
            )}
            <span className={styles.commentUsername}>{comment.user.displayName}</span>
          </div>
          <div className={styles.commentActions}>
            <button
              className={styles.commentAction}
              onClick={() => handleAddReaction(comment.id, "like")}
            >
              <ThumbUpIcon
                className={`${styles.commentLikeIcon} ${
                  comment.userReaction === "like" ? styles.active : ""
                } ${clicked.like === comment.id ? styles.clickAnimation : ""}`}
              />
              {formatNumber(comment.likes)}
            </button>
            <button
              className={styles.commentAction}
              onClick={() => handleAddReaction(comment.id, "dislike")}
            >
              <ThumbDownIcon
                className={`${styles.commentDislikeIcon} ${
                  comment.userReaction === "dislike" ? styles.active : ""
                } ${clicked.dislike === comment.id ? styles.clickAnimation : ""}`}
              />
              {formatNumber(comment.dislikes)}
            </button>
          </div>
        </div>
        <div className={comment.isDeleted ? styles.commentContentDeleted : styles.commentContent}>
          <p>
            {comment.isDeleted ? (
              "[Deleted]"
            ) : parentComment ? (
              <>
                <span>@{comment.mentionedUserId || parentComment.user.displayName}</span>{" "}
                {comment.content}
              </>
            ) : (
              comment.content
            )}
          </p>
        </div>
        <div className={styles.commentFooter}>
          <p className={styles.commentTimestamp}>
            {new Date(comment.createdAt.toDate()).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
          {!comment.isDeleted && (
            <div className={styles.commentActions}>
              <button className={styles.commentReplyButton} onClick={() => setParentId(comment.id)}>
                <ReplyIcon className={styles.commentReplyIcon} />
                Reply
              </button>
              <button className={styles.reportButton}>
                <ReportIcon className={styles.reportIcon} />
                Report
              </button>
            </div>
          )}
        </div>
        {parentId === comment.id && (
          <form
            onSubmit={(e) => handleAddComment(e, comment.id, comment.userId)}
            className={styles.replyForm}
          >
            <input type="text" name="comment" placeholder="Write a reply..." required />
            <button type="submit">
              Post
              <SendIcon className={styles.sendIcon} />
            </button>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.replies}>
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentSectionTitle}>
        <CommentIcon className={styles.commentIcon} />
        <h2>Comments</h2>
        <p>{formatNumber(commentsNumber)}</p>
      </div>
      {currentUser && (
        <form onSubmit={(e) => handleAddComment(e)} className={styles.commentForm}>
          <input type="text" name="comment" placeholder="Write a comment..." required />
          <button type="submit">
            Post
            <SendIcon className={styles.sendIcon} />
          </button>
        </form>
      )}
      <div className={styles.commentSectionContent}>
        {comments && comments.length > 0 ? (
          comments
            .filter((comment) => !comment.parentCommentId)
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((comment) => <Comment key={comment.id} comment={comment} />)
        ) : (
          <div className={styles.noComments}>
            <p>No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
