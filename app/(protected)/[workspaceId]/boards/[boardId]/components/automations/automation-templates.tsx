"use client";

import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { AUTOMATION_CATEGORIES, AUTOMATION_TEMPLATES } from "@/constants/automation-templates";
import { useRef, useState, useEffect } from 'react';

interface TemplatesProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleTemplateSelect: (template: any) => void;
}

export const AutomationTemplates = ({
    searchTerm,
    setSearchTerm,
    handleTemplateSelect
}: TemplatesProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(categoryId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveCategory(categoryId);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveCategory(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        AUTOMATION_CATEGORIES.forEach((category) => {
            const element = document.getElementById(category.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const allTemplates = Object.entries(AUTOMATION_TEMPLATES);

    const searchedTemplates = allTemplates.map(([category, templates]) => ({
        category,
        templates: templates.filter(
            (template) =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(({ templates }) => templates.length > 0);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border rounded-xl p-4 overflow-y-auto">
                <div className="fixed">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Categories</h3>
                        <ul className="space-y-1">
                            {AUTOMATION_CATEGORIES.map((category) => (
                                <li key={category.id}>
                                    <button
                                        onClick={() => scrollToCategory(category.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${activeCategory === category.id
                                            ? "bg-blue-100 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {category.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            {/* Main content */}
            <ScrollArea className="flex-1">
                <div ref={containerRef} className="p-6">
                    {searchedTemplates.map(({ category, templates }) => (
                        <div key={category} className="mb-8">
                            <h2 id={category} className="text-2xl font-bold mb-4 scroll-mt-6">{AUTOMATION_CATEGORIES.find(c => c.id === category)?.label}</h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence>
                                    {templates.map((template) => (
                                        <motion.div
                                            key={template.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleTemplateSelect(template)}
                                            className="px-6 py-4 bg-white border rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                                        >
                                            <h4 className="font-medium text-lg mb-2">{template.name}</h4>
                                            <p className="text-gray-500 text-sm">{template.description}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};