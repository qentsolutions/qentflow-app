"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";


interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

export const NavigationItem = ({ id, imageUrl, name }: NavigationItemProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <button onClick={onClick} className="flex justify-between items-center w-full m-2">
      {name}
      <Image
            src={imageUrl}
            alt="Channel"
            width={40}
            height={40}
          />
    </button>
  );
};
