"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/form/form-textarea";
import { useAction } from "@/hooks/use-action";
import { createComment } from "@/actions/tasks/create-card-comment";
import { deleteComment } from "@/actions/tasks/delete-card-comment"; // Import de l'action serveur
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CommentsProps = {
  items: Comment[];
  cardId: string;
};


export const Comments = ({ items, cardId }: CommentsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [comments, setComments] = useState<Comment[]>(items);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const user = useCurrentUser();

  // Appel des hooks avant la logique conditionnelle
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
      const { id: commentId } = data; // Extraction de l'ID du commentaire
      toast.success("Comment deleted!");
      setComments((prevComments) => {
        const updatedComments = prevComments.filter((comment) => comment.id !== commentId);
        return updatedComments;
      });
    },
    onError: (error) => toast.error(error),
  });

  // Vérification de l'utilisateur après avoir appelé les hooks
  if (!user) {
    toast.error("User not found or not authenticated.");
    return null;  // Ou handlez l'absence de l'utilisateur autrement
  }

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
      await executeCreateComment({ text, cardId, workspaceId, boardId, userId });
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { workspaceId, boardId } = params as { workspaceId: string; boardId: string };
      const userId = user?.id;
      if (!userId) {
        toast.error("User ID is required.");
        return;
      }

      const response = await executeDeleteComment({ commentId, workspaceId, boardId, userId });
      toast.success("Comment deleted!");
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));

    } catch (error) {
      toast.error("Failed to delete comment.");
    }
  };

  const sortedComments = [...comments].sort((a, b) =>
    sortOrder === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <CommentForm
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        newComment={newComment}
        setNewComment={setNewComment}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        fieldErrors={fieldErrors}
      />
      <CommentSorter sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <CommentList comments={sortedComments} onDelete={handleDelete} user={user} />
    </div>
  );
};


const CommentForm = ({
  isEditing,
  setIsEditing,
  newComment,
  setNewComment,
  isSubmitting,
  handleSubmit,
  fieldErrors,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  newComment: string;
  setNewComment: (value: string) => void;
  isSubmitting: boolean;
  handleSubmit: (formData: FormData) => void;
  fieldErrors: any;
}) => (
  <div className="mt-4">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        handleSubmit(formData);
      }}
    >
      <div onClick={() => setIsEditing(true)} role="button">
        {!isEditing ? (
          <div className="pb-12 border mt-2 pt-2 pl-2 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm">{newComment ? "" : "Write a comment..."}</p>
          </div>
        ) : (
          <div>
            <FormTextarea
              id="new-comment"
              placeholder="Write a comment..."
              className="pb-20 mt-2 pt-2 pl-2 rounded-lg bg-gray-50"
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
);

const CommentSorter = ({
  sortOrder,
  setSortOrder,
}: {
  sortOrder: "newest" | "oldest";
  setSortOrder: (value: "newest" | "oldest") => void;
}) => (
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
);

const CommentList = ({ comments, onDelete, user }: { comments: Comment[]; onDelete: (commentId: string) => void, user: { id: string } }) => (
  <div>
    {comments.length === 0 ? (
      <p className="text-muted-foreground">No comments yet.</p>
    ) : (
      <ul className="space-y-8">
        {comments.map((comment) => (
          <li key={comment.id}>
            <div className="group flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={comment.user?.image} alt={comment.user?.name || "undefined"} />
                <AvatarFallback>{comment.user.name.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{comment.user.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.text}</p>
                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {user?.id === comment.user.id && (
                    <Button
                      variant="ghost"
                      onClick={() => { }}
                      className="text-red-500"
                    >
                      <p className="text-neutral-600 text-xs">Edit</p>
                    </Button>
                  )}
                  {user?.id === comment.user.id && (
                    <Button
                      variant="ghost"
                      onClick={() => onDelete(comment.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <p className="text-neutral-600 text-xs">Delete</p>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </li>

        ))}
      </ul>
    )}
  </div>
);
