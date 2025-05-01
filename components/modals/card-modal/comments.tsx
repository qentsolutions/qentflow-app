"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/form/form-textarea";
import { useAction } from "@/hooks/use-action";
import { createComment } from "@/actions/tasks/create-card-comment";
import { deleteComment } from "@/actions/tasks/delete-card-comment";
import { updateComment } from "@/actions/tasks/update-card-comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { formatDistanceToNow } from "date-fns";
import { LinkPreview } from "@/components/ui/link-preview";

interface CommentsProps {
  items: Comment[];
  cardId: string;
  readonly?: boolean;
}

export const Comments = ({ items, cardId, readonly = false }: CommentsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [comments, setComments] = useState<Comment[]>(items);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const user = useCurrentUser();
  const params = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { execute: executeCreateComment, fieldErrors } = useAction(createComment, {
    onSuccess: (newComment) => {
      toast.success("Comment added!");
      setComments((prevComments) => [
        { ...newComment, user: { id: user?.id ?? "", name: user?.name ?? "", image: user?.image ?? "" }, createdAt: newComment.createdAt.toString() },
        ...prevComments,
      ]);
      setNewComment("");
      setIsEditing(false);
    },
    onError: (error) => toast.error(error),
  });

  const { execute: executeDeleteComment } = useAction(deleteComment, {
    onSuccess: (data) => {
      const { id: commentId } = data;
      toast.success("Comment deleted!");
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    },
    onError: (error) => toast.error(error),
  });

  const { execute: executeUpdateComment } = useAction(updateComment, {
    onSuccess: (data) => {
      toast.success("Comment updated!");
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingCommentId
            ? { ...comment, text: editingText, modified: true }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditingText("");
    },
    onError: (error) => {
      toast.error("Failed to update comment.");
    },
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);
  };

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get("new-comment") as string;
    if (!text.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = user?.id;
      if (!userId) {
        toast.error("User ID is required.");
        return;
      }
      const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };

      await executeCreateComment({
        text,
        cardId,
        workspaceId: workspaceId,
        boardId: boardId,
        userId
      });

    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const userId = user?.id;
      if (!userId) {
        toast.error("User ID is required.");
        return;
      }

      const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };

      await executeDeleteComment({
        commentId,
        workspaceId: workspaceId,
        boardId: boardId,
        userId,
      });

      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      toast.error("Failed to delete comment.");
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editingText.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) {
        toast.error("User ID is required.");
        return;
      }
      const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };

      await executeUpdateComment({
        commentId,
        text: editingText,
        workspaceId: workspaceId,
        boardId: boardId,
        userId
      });

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingCommentId
            ? { ...comment, text: editingText, modified: true }
            : comment
        )
      );

      setEditingText("");
      setEditingCommentId(null);
      toast.success("Comment updated!");
    } catch (error) {
      toast.error("Failed to update comment.");
    }
  };

  const sortedComments = [...comments].sort((a, b) =>
    sortOrder === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const highlightLinks = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);

    return parts.map((part, index) => {
      if (part.startsWith('http')) {
        return (
          <LinkPreview key={index} url={part}>
            <a href={part} target="_blank" className="text-blue-600">{part}</a>
          </LinkPreview>
        );
      }
      // Split the part by new lines and render each line in a separate paragraph
      return part.split('\n').map((line, lineIndex) => (
        <p key={`${index}-${lineIndex}`} className="text-sm text-foreground">
          {line}
        </p>
      ));
    });
  };



  return (
    <div className="space-y-6 pb-10">
      {!readonly &&
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSubmit(formData);
            }}
          >
            <div onClick={() => setIsEditing(true)} role="button" className="relative">
              {!isEditing ? (
                <div className="pb-12 border mt-2 pt-2 pl-2 rounded-lg bg-gray-50 dark:text-gray-200 dark:bg-gray-700">
                  <p className="text-gray-500 text-sm">{newComment ? "" : "Write a comment..."}</p>
                </div>
              ) : (
                <div className="relative">
                  <FormTextarea
                    ref={textareaRef}
                    id="new-comment"
                    value={newComment}
                    onChange={handleTextChange}
                    placeholder="Write a comment..."
                    className="pb-20 mt-2 pt-2 pl-2 rounded-lg bg-gray-50 dark:text-gray-200 dark:bg-gray-700"
                    errors={fieldErrors}
                  />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex space-x-2 mt-2">
                <Button type="submit" disabled={isSubmitting} size="sm" className="bg-blue-500 hover:bg-blue-700">
                  {isSubmitting ? "Adding..." : "Add Comment"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewComment("");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      }

      <div className="flex justify-end items-center space-x-2">
        <Label htmlFor="sort-comments" className="text-sm">
          Sort by
        </Label>
        <Select onValueChange={(value) => setSortOrder(value as "newest" | "oldest")} value={sortOrder}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-gray-700 text-xs">No comments yet.</p>
        ) : (
          <ul className="space-y-8">
            {sortedComments.map((comment) => (
              <li key={comment.id}>
                <div className="group flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={comment.user?.image} alt={comment.user?.name || "undefined"} />
                    <AvatarFallback>{comment.user.name.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-x-2">
                        {comment.user.name}
                        {comment.modified && <p className="font-normal text-xs text-gray-500">(modified)</p>}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div>
                        <FormTextarea
                          id="edit-comment"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="mt-2"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <Button
                            onClick={() => handleUpdate(comment.id)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-700"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingText("");
                              setEditingCommentId(null);
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground">
                        {highlightLinks(comment.text)}
                      </p>
                    )}
                    {!readonly && (
                      <div>{editingCommentId !== comment.id && (
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {user?.id === comment.user.id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingText(comment.text);
                                  setEditingCommentId(comment.id);
                                }}
                                className="text-neutral-600 hover:text-neutral-800 mr-8"
                              >
                                <p className="text-xs">Edit</p>
                              </button>
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <p className="text-xs">Delete</p>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Comments.Skeleton = function CommentsSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[78px] bg-neutral-200" />
      </div>
    </div>
  );
};
