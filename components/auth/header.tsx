interface HeaderProps {
  label: string;
};

export const Header = ({
  label,
}: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <p className=" text-lg text-gray-700">
        {label}
      </p>
    </div>
  );
};
