import { Card, List, Tag, Document } from "@prisma/client";

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
  user: {
    id: any;
    image: string;
    name: string;
  };
};
