export const CONTENT_TYPES = [
  ["blog_post", "Blog post"], ["social_post", "Social posts"], ["email", "Email"],
  ["ad_copy", "Ad copy"], ["product_description", "Product description"], ["other", "Other"],
] as const;
export const typeLabel = (v: string) => CONTENT_TYPES.find(([k]) => k === v)?.[1] ?? "Content";
