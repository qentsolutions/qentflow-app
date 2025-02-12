import { MessageSquare, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { AUTOMATION_CATEGORIES, AUTOMATION_TEMPLATES } from "@/constants/automation-templates";
import { useRef, useState, useEffect } from 'react';
import {
    ArrowRight,
    Bell,
    Calendar,
    CheckCircle,
    ClipboardList,
    FilePlus,
    Mail,
    MoveRight,
    Pencil,
    PlusCircle,
    Tag,
    UserPlus,
    ListChecks,
    RefreshCcw,
    History,
    Star,
    User
} from 'lucide-react';

const TRIGGER_ICONS = {
    CARD_CREATED: <PlusCircle />,
    CARD_MOVED: <MoveRight />,
    CARD_UPDATED: <Pencil />,
    TASK_COMPLETED: <CheckCircle />,
    COMMENT_ADDED: <MessageSquare />,
    ATTACHMENT_ADDED: <FilePlus />,
    TASK_ADDED: <ClipboardList />,
    DUE_DATE_APPROACHING: <Calendar />,
    ALL_TASKS_COMPLETED: <ListChecks />,
    USER_MENTIONED: <User />,
    CARD_ASSIGNED: <UserPlus />,
};

const ACTION_ICONS = {
    UPDATE_CARD_STATUS: <RefreshCcw />,
    ASSIGN_USER: <UserPlus />,
    SEND_NOTIFICATION: <Bell />,
    CREATE_TASKS: <ClipboardList />,
    MOVE_CARD: <MoveRight />,
    ADD_TAG: <Tag />,
    CREATE_CALENDAR_EVENT: <Calendar />,
    CREATE_AUDIT_LOG: <History />,
    UPDATE_CARD_PRIORITY: <Star />,
    SEND_EMAIL: <Mail />,
};

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
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(categoryId);
        if (element && mainContentRef.current) {
            const containerTop = mainContentRef.current.offsetTop;
            const elementTop = element.offsetTop;
            mainContentRef.current.scrollTo({
                top: elementTop - containerTop - 20, // Ajout d'un petit offset pour améliorer la synchronisation
                behavior: 'smooth'
            });
            setActiveCategory(categoryId);
        }
    };

    useEffect(() => {
        if (!mainContentRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    setActiveCategory(entry.target.id);
                }
            });
        }, {
            root: mainContentRef.current,
            rootMargin: '-20% 0px -60% 0px', // Ajustement des marges pour une meilleure détection
            threshold: [0, 0.5, 1]
        });

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
            (template: any) =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(({ templates }) => templates.length > 0);

    // Fonction pour obtenir le nombre de templates par catégorie
    const getTemplateCount = (categoryId: string) => {
        return AUTOMATION_TEMPLATES[categoryId as keyof typeof AUTOMATION_TEMPLATES]?.length || 0;
    };

    return (
        <div className="flex h-[80vh] pb-32 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 overflow-y-auto bg-gray-50 border rounded-lg sticky top-0">
                <div className="p-4">
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
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex justify-between items-center ${activeCategory === category.id
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        <span>{category.label}</span>
                                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                            {getTemplateCount(category.id)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div ref={mainContentRef} className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {searchedTemplates.map(({ category, templates }) => (
                        <div key={category} className="mb-8">
                            <h2 id={category} className="text-2xl font-bold mb-4 scroll-mt-6">
                                {AUTOMATION_CATEGORIES.find(c => c.id === category)?.label}
                            </h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence>
                                    {templates.map((template: any) => (
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
                                            <div className="flex mb-2 flex-col gap-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-blue-500 p-1 text-white rounded-lg">
                                                        {TRIGGER_ICONS[template.trigger.type as keyof typeof TRIGGER_ICONS]}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    <span className="bg-pink-500 p-1 text-white rounded-lg">
                                                        {ACTION_ICONS[template.actions[0].type as keyof typeof ACTION_ICONS]}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-lg">{template.name}</h4>
                                            </div>
                                            <p className="text-gray-500 text-sm">{template.description}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutomationTemplates;