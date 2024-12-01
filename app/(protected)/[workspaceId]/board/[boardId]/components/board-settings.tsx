import SettingsSection from "./settings-section";

const BoardSettings = () => {
  return (
    <SettingsSection
      title="Paramètres généraux"
      description="Configurez les paramètres de base de votre board."
    >
      <div className="p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom du board
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Mon board"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Description de votre board..."
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type de board
          </label>
          <select
            id="type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option>Scrum</option>
            <option>Kanban</option>
            <option>Simple</option>
          </select>
        </div>
      </div>
    </SettingsSection>
  );
};

export default BoardSettings;