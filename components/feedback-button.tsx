'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentRole } from '@/hooks/use-current-role';
import { submitFeedback } from '@/actions/feedback/submit-feedback';
import { deleteFeedback } from '@/actions/feedback/delete-feedback'; // Importer la fonction de suppression

interface Feedback {
    id: string;
    content: string;
    createdAt: string;
}

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const currentRole = useCurrentRole();
    const isAdmin = currentRole === 'ADMIN';

    useEffect(() => {
        if (isAdmin && isOpen) {
            fetchFeedbacks();
        }
    }, [isAdmin, isOpen]);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('/api/feedback');
            if (!response.ok) {
                throw new Error('Failed to fetch feedbacks');
            }
            const data = await response.json();
            setFeedbacks(data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await submitFeedback(feedback);
            setSubmitMessage("Thank you for your feedback!");
            setFeedback('');
        } catch (error) {
            setSubmitMessage('Une erreur est survenue. Veuillez réessayer.');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (feedbackId: string) => {
        try {
            const response = await deleteFeedback(feedbackId); // Appeler la fonction de suppression
            if (response.success) {
                setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackId)); // Rafraîchir la liste
            } else {
                console.error('Error deleting feedback');
            }
        } catch (error) {
            console.error('Failed to delete feedback:', error);
        }
    };

    return (
        <>
            <Button
                className="fixed bottom-20 right-10 rounded-full p-0 w-12 h-12 bg-primary hover:bg-primary/90"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-36 right-8 w-96 bg-background border rounded-lg shadow-lg p-4"
                    >
                        <Tabs defaultValue="share" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="share">Share a feedback</TabsTrigger>
                                {isAdmin && <TabsTrigger value="list">List of feedback</TabsTrigger>}
                            </TabsList>
                            <TabsContent value="share">
                                <form onSubmit={handleSubmit} className="mt-8">
                                    <Textarea
                                        placeholder="Your feedback here, it could be new feature to implement etc..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="mb-4"
                                        rows={4}
                                    />
                                    <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
                                        {isSubmitting ? 'Sending...' : 'Send'}
                                    </Button>
                                </form>
                                {submitMessage && (
                                    <p className="mt-2 text-sm text-muted-foreground">{submitMessage}</p>
                                )}
                            </TabsContent>
                            {isAdmin && (
                                <TabsContent value="list" className="mt-8">
                                    {feedbacks.length === 0 ? (
                                        <p>No feedback for the moment.</p>
                                    ) : (
                                        <ul className="space-y-4 max-h-96 overflow-y-auto">
                                            {feedbacks.map((feedback) => (
                                                <li key={feedback.id} className="bg-muted p-3 rounded-md flex justify-between items-start">
                                                    <div>
                                                        <p className="mb-2">{feedback.content}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Created : {new Date(feedback.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDelete(feedback.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </TabsContent>
                            )}
                        </Tabs>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
