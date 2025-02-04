interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
  }
  
  const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
    return (
      <div>
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5 rounded-t-lg">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {children}
      </div>
    );
  };
  
  export default SettingsSection;