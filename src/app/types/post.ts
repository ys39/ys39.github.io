export interface PostData {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  contentHtml?: string;
  isOpen?: boolean;
}

export interface TagRelatedData {
  [key: string]: PostData[];
}
