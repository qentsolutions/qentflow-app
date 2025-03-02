import { Room } from "./components/room";

import { Canvas } from "./components/canvas";
import { Loading } from "./components/loading";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
};

const Whiteboard = ({
  params,
}: BoardIdPageProps) => {
  return (
    <Room roomId={params.boardId} fallback={<Loading />}>
      <Canvas boardId={params.boardId} />
    </Room>
  );
};

export default Whiteboard;
