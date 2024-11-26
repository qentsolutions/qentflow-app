
import SettingsNavbar from "./components/navbar";

// Create a layout
interface SettingsLayoutProps {
    children: React.ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProps) => {

    return (
        <div className="flex h-screen bg-background">
            <SettingsNavbar />
            <div className="flex-1 p-6 space-y-6">
                {children}
            </div>
        </div>
    );
}

export default SettingsLayout;