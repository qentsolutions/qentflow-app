import { Card, List, Tag, Document, WorkspaceMember, User, Server } from "@prisma/client";
import { NextApiResponse } from "next";
import { Server as NetServer, Socket } from "net";
import { Server as SocketIOServer } from "socket.io";


export type ListWithCards = List & {
  cards: Card[];
};

export type CardWithList = Card & {
  list: List;
  tags: Tag[];
  documents: Document[];
};
export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  modified: boolean;
  user: {
    id: any;
    image: string;
    name: string;
  };
};


export type ServerWithMembersWithProfiles = Server & {
  members: (WorkspaceMember & { profile: User })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};