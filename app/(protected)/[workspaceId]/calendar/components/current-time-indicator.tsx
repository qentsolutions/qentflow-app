// Inside CurrentTimeIndicator component
export const CurrentTimeIndicator = ({ topPosition }: { topPosition: number }) => {
    return (
      <div
        style={{ top: `${topPosition}rem` }}
        className="absolute left-0 right-0 h-[2px] bg-blue-500 z-10"
      />
    );
  };
  