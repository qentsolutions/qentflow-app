"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface ButtonCheckoutProps {
    priceId: string;
    mode?: "payment" | "subscription";
    disabled?: boolean;
    workspaceName: string;
    onSubmit: () => Promise<{ workspaceId?: string; error?: string }>;
}

const ButtonCheckout = ({
    priceId,
    mode = "payment",
    disabled = false,
    workspaceName,
    onSubmit,
}: ButtonCheckoutProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        if (!workspaceName) return;
        setIsLoading(true);

        try {
            // First create the workspace
            const result = await onSubmit();
            
            if (result.error || !result.workspaceId) {
                console.error("Failed to create workspace:", result.error);
                setIsLoading(false);
                return;
            }

            // Then proceed with payment
            const response = await axios.post("/api/stripe/create-checkout", {
                priceId,
                successUrl: `${window.location.origin}/${result.workspaceId}`,
                cancelUrl: window.location.href,
                mode,
                workspaceName,
            });

            const { url } = response.data;
            window.location.href = url;
        } catch (e) {
            console.error(e);
        }

        setIsLoading(false);
    };

    return (
        <Button
            className="btn btn-warning btn-block group"
            onClick={() => handlePayment()}
            disabled={disabled || isLoading}
        >
           <ShieldCheck /> {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
    );
};

export default ButtonCheckout;