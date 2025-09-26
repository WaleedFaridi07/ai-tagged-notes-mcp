export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  summary?: string;
  tags?: string[];
};

export type EnrichResult = {
  summary: string;
  tags: string[];
};
