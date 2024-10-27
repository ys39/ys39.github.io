export interface PostData {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  contentHtml?: string;
}

export interface TagRelatedData {
  [key: string]: PostData[];
}
