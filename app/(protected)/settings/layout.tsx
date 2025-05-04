
import SettingsNavbar from "./components/navbar";
interface SettingsLayoutProps {
    children: React.ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProps) => {

    return (
        <div className="flex h-full bg-background">
            <SettingsNavbar />
            <div className="ml-64 flex-1 p-2 space-y-6 dark:bg-background">
                {children}
            </div>
        </div>
    );
}

export default SettingsLayout;