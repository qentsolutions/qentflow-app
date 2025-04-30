"use client";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

type Option = {
    value: string;
    label: string;
}

type RedirectOption = Option & {
    redirect: string;
}

type PlanOption = {
    value: string;
    label: string;
    description: string;
    priceMonthly: string;
    priceAnnually: string;
    benefits: string[];
}

type Step = {
    id: string;
    title: string;
    description: string;
    options: Option[];
    image: string;
}

type RedirectStep = Omit<Step, 'options'> & {
    options: RedirectOption[];
}

type PlanStep = Omit<Step, 'options'> & {
    options: PlanOption[];
}

const steps: (Step | RedirectStep | PlanStep)[] = [
    {
        id: "usage",
        title: "How will you primarily use Qentflow?",
        description: "Select the main purpose for using our tool.",
        options: [
            { value: "work", label: "Work" },
            { value: "personal", label: "Personal Projects" },
            { value: "education", label: "Educational Purposes" },
            { value: "other", label: "Other" },
        ],
        image: "/step-illustration.png",
    },
    {
        id: "role",
        title: "What is your role in your projects?",
        description: "Choose the role that best describes your involvement.",
        options: [
            { value: "manager", label: "Project Manager" },
            { value: "developer", label: "Developer" },
            { value: "designer", label: "Designer" },
            { value: "marketer", label: "Marketer" },
            { value: "analyst", label: "Analyst" },
            { value: "other", label: "Other" },
        ],
        image: "/step-illustration.png",
    },
    {
        id: "team-size",
        title: "How large is your team?",
        description: "Select the size of your team to help us tailor the experience.",
        options: [
            { value: "solo", label: "Just Me" },
            { value: "small", label: "2-10" },
            { value: "medium", label: "11-50" },
            { value: "large", label: "51-200" },
            { value: "xl", label: "200+" },
        ],
        image: "/step-illustration.png",
    },
    {
        id: "experience",
        title: "Have you used Qentflow before?",
        description: "Let us know your experience level.",
        options: [
            { value: "experienced", label: "Yes, extensively" },
            { value: "some", label: "Yes, occasionally" },
            { value: "none", label: "No, this is my first time" },
        ],
        image: "/step-illustration.png",
    },
    {
        id: "goals",
        title: "What are your primary goals with our tool?",
        description: "Select your main objectives.",
        options: [
            { value: "efficiency", label: "Improve Project Efficiency" },
            { value: "collaboration", label: "Enhance Team Collaboration" },
            { value: "tracking", label: "Better Task Tracking" },
            { value: "reporting", label: "Advanced Reporting" },
            { value: "other", label: "Other" },
        ],
        image: "/step-illustration.png",
    },
    {
        id: "plan",
        title: "Which plan would you like?",
        description: "Select the plan that best fits your needs.",
        options: [
            {
                value: "starter",
                label: "Starter",
                description: "Ideal for small teams or individual projects.",
                priceMonthly: "Free",
                priceAnnually: "Free",
                benefits: ["Up to 5 users", "Basic features", "Community support"]
            },
            {
                value: "professional",
                label: "Professional",
                description: "Perfect for growing teams and businesses.",
                priceMonthly: "$10",
                priceAnnually: "$100",
                benefits: ["Up to 50 users", "Advanced features", "Priority support"]
            },
            {
                value: "organization",
                label: "Organization",
                description: "Best for large organizations with complex needs.",
                priceMonthly: "$20",
                priceAnnually: "$200",
                benefits: ["Unlimited users", "All features", "Dedicated support"]
            },
        ],
        image: "/step-illustration.png",
    },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({
        usage: "work", // Default selected option
    })
    const [billingCycle, setBillingCycle] = useState("annually")
    const [showComparePopup, setShowComparePopup] = useState(false)
    const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const step = steps[currentStep]

    useEffect(() => {
        if (step.id === "plan") {
            // Recommend a plan based on previous responses
            let plan = "starter"
            if (responses["team-size"] === "medium" || responses["team-size"] === "large" || responses["team-size"] === "xl") {
                plan = "professional"
            }
            if (responses["team-size"] === "xl" || responses["role"] === "manager") {
                plan = "organization"
            }
            setRecommendedPlan(plan)
        }
    }, [step.id, responses])

    const handleNext = async () => {
        if (!responses[step.id]) {
            setError("Please select an option to continue.")
            return
        }

        setError(null) // Clear any previous error

        if (currentStep === steps.length - 1) {
            // Submit responses and redirect
            try {
                await fetch("/api/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ responses }),
                })
                router.push("/workspace/select")
            } catch (error) {
                console.error("Error submitting onboarding:", error)
            }
        } else {
            // Move to next step
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleOptionSelect = (value: string) => {
        setResponses({ ...responses, [step.id]: value })
    }

    const progressPercentage = ((currentStep + 1) / steps.length) * 100

    return (
        <div className="fixed inset-0 z-50 w-screen h-screen flex">
            {/* Full width for plan selection step */}
            <div className={`${step.id === "plan" ? "w-full" : "w-full md:w-1/2"} bg-[#272727] text-white p-8 flex flex-col`}>
                <div className="flex items-center mb-12">
                    <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="ml-2">
                        <Image src="/logo_only_icon.svg" alt="Qentflow Logo" height={60} width={60} priority />
                    </div>
                </div>

                <div className={`flex-1 flex flex-col mx-12`}>
                    <div className={`mb-8 text-center ${step.id === "plan" ? "mb-4" : ""}`}>
                        <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
                        <p className="text-gray-400">{step.description}</p>
                    </div>

                    {step.id === "plan" && (
                        <div className="mb-8 flex justify-between items-center">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setBillingCycle("annually")}
                                    className={cn(
                                        "text-lg font-bold py-2 rounded-none transition-all",
                                        billingCycle === "annually"
                                            ? "border-b-white border-b-2 text-white"
                                            : "border-b-transparent text-gray-400 border-b-2"
                                    )}
                                >
                                    Annually{" "}
                                    <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        Get 1 Month Free
                                    </span>
                                </button>
                                <button
                                    onClick={() => setBillingCycle("monthly")}
                                    className={cn(
                                        "text-lg font-bold py-2 rounded-none transition-all",
                                        billingCycle === "monthly"
                                            ? "border-b-white border-b-2 text-white"
                                            : "border-b-transparent text-gray-400 border-b-2"
                                    )}
                                >
                                    Monthly
                                </button>
                            </div>
                            <Button
                                onClick={() => setShowComparePopup(true)}
                                className="text-lg underline underline-offset-4 bg-transparent text-white px-6 py-2 rounded-none border-b-white"
                            >
                                Compare Plans
                            </Button>
                        </div>
                    )}

                    {step.id === "plan" ? (
                        <div className="flex justify-center space-x-4">
                            {step.options.map((option: any) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={cn(
                                        "w-1/3 p-6 border rounded-lg cursor-pointer transition-colors",
                                        responses[step.id] === option.value ? "bg-[#444C6D] border-[#3579BF] text-[#3579BF]" : "hover:bg-gray-800 border-[#3A3A3A]"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">{option.label}</h2>
                                        <div className="flex items-center gap-x-2">
                                            <span>{recommendedPlan === option.value && <p className="text-green-500">Recommended</p>}</span>
                                            <input
                                                type="radio"
                                                name="plan"
                                                checked={responses[step.id] === option.value}
                                                readOnly
                                                className="form-radio text-blue-600 w-5 h-5 bg-black"
                                            />
                                        </div>

                                    </div>
                                    <p className="text-gray-400 mb-4">{option.description}</p>
                                    <p className="text-5xl font-semibold mb-4">
                                        {billingCycle === "annually" ? option.priceAnnually : option.priceMonthly}
                                        {billingCycle === "annually" && option.priceMonthly !== "Free" && (
                                            <span className="ml-2 text-gray-400 line-through">{option.priceMonthly}</span>
                                        )}
                                    </p>
                                    <p className="italic text-sm mb-2 text-gray-500">
                                        {billingCycle === "annually" ? "Per Month, Billed Annually." : "Per Month. Cancel Anytime."}
                                        <br />
                                        {billingCycle === "annually" && "Get 1 Month Free!"}
                                    </p>
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Separator className="w-full text-[#C7C7C7]" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className={cn(
                                                "px-2 text-[#C7C7C7]",
                                                responses[step.id] === option.value ? "bg-[#444C6D]" : "bg-[#272727]"
                                            )}>
                                                PLUS
                                            </span>
                                        </div>
                                    </div>
                                    <ul className="text-gray-400 space-y-2">
                                        {option.benefits.map((benefit: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-blue-500 mt-1" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 mb-auto space-x-2">
                            {step.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={cn(
                                        "text-left px-5 py-3 rounded-lg border border-gray-700 transition-colors",
                                        responses[step.id] === option.value ? "bg-[#444C6D] border-[#3579BF] text-[#3579BF]" : "hover:bg-gray-800"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-8 flex items-center justify-between">
                        <div className="w-[200px] bg-gray-700 h-1.5 rounded-full mb-6">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
                        </div>

                        <div className="flex justify-between">
                            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                                Continue
                            </Button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </div>
            </div>

            {/* Right side - Gray placeholder */}
            {step.id !== "plan" && (
                <div className="hidden md:block md:w-1/2 relative">
                    <Image
                        src={step.image}
                        alt="Step illustration"
                        fill
                        className="object-cover object-left"
                        priority
                    />
                </div>
            )}

            {/* Compare Plans Popup */}
            {showComparePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center md:px-28 bg-black bg-opacity-50">
                    <div className="bg-[#272727] p-14 rounded-lg w-full overflow-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl text-white font-bold mb-4">Compare Plans</h2>
                            <Button onClick={() => setShowComparePopup(false)} className="bg-transparent shadow-none text-white">
                                <X className="text-gray-200" size={28} />
                            </Button>
                        </div>

                        <div className="lg:flex flex-col justify-center px-10 pb-12">
                            <div className="border-t border-solid border-gray-900 border-opacity-10">
                                <div className="flex gap-5">
                                    <div className="flex flex-col w-[24%]">
                                        <div className="mt-24 text-lg font-semibold leading-6 text-white">
                                            Plans
                                        </div>
                                    </div>
                                    {steps.find(s => s.id === "plan")?.options.map((option: any, index: number) => (
                                        <div key={option.value} className={`flex flex-col ml-5 w-[${index === 0 ? '24%' : '38%'}]`}>
                                            <div className="flex flex-col mt-12 text-sm">
                                                <div className="flex flex-col">
                                                    <div className="h-4">
                                                        {recommendedPlan === option.value && (
                                                            <p className="text-green-500 text-xs">Recommended</p>
                                                        )}
                                                    </div>
                                                    <div className={`font-semibold text-base leading-[171%] ${recommendedPlan === option.value ? 'text-blue-600' : 'text-white'}`}>
                                                        {option.label}
                                                    </div>
                                                </div>

                                                <div className="mt-4 leading-6 text-gray-400">
                                                    {option.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="flex gap-5 mt-10 w-full">
                                <div className="flex flex-col my-auto text-sm leading-4 text-gray-400 mx-14">
                                    <div>Up to 5 users</div>
                                    <div className="mt-9">Advanced features</div>
                                    <div className="mt-9">Priority support</div>
                                    <div className="mt-9">Unlimited users</div>
                                </div>
                                <div className="flex-auto px-px">
                                    <div className="flex gap-5">
                                        {steps.find(s => s.id === "plan")?.options.map((option: any, index: number) => (
                                            <div key={option.value} className={`flex flex-col w-[${index === 0 ? '33%' : '33%'}]`}>
                                                <div className={`flex justify-center items-center px-16 py-4 rounded-lg shadow-sm ${recommendedPlan === option.value ? 'border-2 border-blue-600' : ''}`}>
                                                    <div className="flex flex-col items-center w-[90px]">
                                                        {option.benefits.map((benefit: string, idx: number) => (
                                                            <div key={idx} className="flex items-center mt-7">
                                                                {benefit.includes("Up to 5 users") || benefit.includes("Advanced features") || benefit.includes("Priority support") ? (
                                                                    <Check className={`w-5 ${recommendedPlan === option.value ? 'text-blue-600' : 'text-blue-600'}`} />
                                                                ) : (
                                                                    <X className="w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
