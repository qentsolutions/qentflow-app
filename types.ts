import { Card, List, Tag } from "@prisma/client";

export type ListWithCards = List & { 
  cards: Card[];
};

export type CardWithList = Card & {
  list: List;
  tags: Tag[]; 
};
export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: any;
    image: string;
    name: string;
  };
};
