import { useRouter } from "next/router";

export const adminRoutes = [
  {
    context: "general",
    name: "Dashboard",
    slug: "dashboard",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=3bbae5b5-9fd0-4520-966d-1b03ee316dd4&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "showAll",
    name: "Show All",
    slug: "all",
    chartUrl: null,
  },
  {
    context: "users",
    name: "Users",
    slug: "users",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=b1450d1a-52c5-4da1-b47c-972c57d29e5f&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "creations",
    name: "Creations",
    slug: "creations",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=98e01a5f-22a2-4aa1-b05a-9910fc06e134&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "domains",
    name: "Domains",
    slug: "domains",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=5cc7ddad-27ce-46cb-ae08-b2056ea91944&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "vault",
    name: "Vault",
    slug: "vault",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=9e35bb43-aec7-4cbf-83ef-7fe58a87990d&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "emails",
    name: "Emails",
    slug: "emails",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=4332200e-eb69-4c26-927c-50200363d1a2&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "phones",
    name: "Phones",
    slug: "phones",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=d8cb6fcd-adc5-481b-b846-a1e787495894&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "proposals",
    name: "Proposals",
    slug: "proposals",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=1e898939-5e37-42d6-980e-08b87e92bdc3&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "stickyNotes",
    name: "Sticky notes",
    slug: "sticky-notes",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=23e5398f-79a7-4d16-ab11-8815d66d85ba&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "simpleWebsites",
    name: "Simple Websites",
    slug: "simple-websites",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=463403d4-f184-4573-a2b9-1b63c6b6a90c&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
  {
    context: "supportChat",
    name: "Support Chat",
    slug: "support-chat",
    chartUrl:
      "https://charts.mongodb.com/charts-aima-tnype/embed/dashboards?id=6f0ddb81-ca6d-47d8-86b0-81f366382163&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=scale&scalingHeight=fixed",
  },
];
export const useDashboard = () => {
  const router = useRouter();
  const { slug } = router.query;

  const adminRoute = adminRoutes.find(r => r.slug === slug) ?? adminRoutes[0];

  return { adminRoute };
};
