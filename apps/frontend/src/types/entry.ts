export interface IEntry {
  id: string;
  date: string; // ISO 8601 format
  mood: number;
  energy: number;
  note: string;
  tags: string[];
}