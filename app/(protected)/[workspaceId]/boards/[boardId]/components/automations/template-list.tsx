// components/automations/template-list.tsx
import { AUTOMATION_TEMPLATES, AUTOMATION_CATEGORIES } from "@/constants/automation-templates";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutomationStore } from "@/hooks/use-automation";

interface TemplateListProps {
    onSelectTemplate: (template: any) => void;
}

export const TemplateList = ({ onSelectTemplate }: TemplateListProps) => {
    const { selectedTemplate, setSelectedTemplate } = useAutomationStore();

    return (
        <ScrollArea className="h-[500px]">
            {AUTOMATION_CATEGORIES.map((category) => (
                <div key={category.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{category.label}</h3>
                    <div className="grid gap-4">
                        {AUTOMATION_TEMPLATES[category.id].map((template) => (
                            <Button
                                key={template.id}
                                variant="outline"
                                className={`w-full justify-start p-4 h-auto ${selectedTemplate === template.id ? "border-primary" : ""
                                    }`}
                                onClick={() => {
                                    setSelectedTemplate(template.id);
                                    onSelectTemplate(template);
                                }}
                            >
                                <div className="text-left">
                                    <h4 className="font-medium">{template.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {template.description}
                                    </p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
        </ScrollArea>
    );
};
