import { useMemo } from "react";

type UserBlogPreviewURLParams = {
  blogId: string;
  domain?: string;
  subdomain?: string;
  slug?: string;
};

export const useBlogPreviewURL = ({
  blogId,
  domain,
  subdomain,
  slug,
}: UserBlogPreviewURLParams) => {
  const PUBLIC_URL = new URL(process.env.NEXT_PUBLIC_BLOG_URL || "");

  return useMemo(() => {
    // custom domain exist, don't use custom subdomain
    if (domain) {
      if (slug) {
        return `https://${domain}/${slug}`;
      }
      return `https://${domain}`;
    }
    // no custom domain, but subdomain exist
    const host = PUBLIC_URL.hostname.replace("www.", "");
    if (subdomain) {
      if (slug) {
        return `https://${subdomain}.${host}/${slug}`;
      }
      return `https://${subdomain}.${host}`;
    }

    // use default blog url
    if (slug) {
      return `${PUBLIC_URL.protocol}//${host}/${blogId}/${slug}`;
    }
    return `${PUBLIC_URL.protocol}//${host}/${blogId}`;
  }, [blogId, domain, subdomain, slug]);
};
