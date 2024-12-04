"use client";

import { useState } from "react";
import axios from "axios"; // Import axios directement
import { Button } from "@/components/ui/button";


const ButtonCheckout = ({
    priceId,
    mode = "payment",
}: {
    priceId: string;
    mode?: "payment" | "subscription";
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // Utilisation directe d'axios
            const response = await axios.post("/api/stripe/create-checkout", {
                priceId,
                successUrl: window.location.href,
                cancelUrl: window.location.href,
                mode,
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
        >
            Buy Workspace
        </Button>
    );
};

export default ButtonCheckout;
