/** @type {import('next').NextConfig} */
const removeImports = require("next-remove-imports")();

const withTM = require("next-transpile-modules")([
  "@pqina/pintura",
  "@pqina/react-pintura",
]);

module.exports = withTM(
  removeImports({
    reactStrictMode: true,
    swcMinify: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    async redirects() {
      return [
        {
          source: "/",
          destination: "/auth/cover-login",
          permanent: true,
        },
        {
          source: "/apps/marketing-hooks",
          destination: "/apps/magic-hooks",
          permanent: true,
        },
        {
          source: "/integrations",
          destination: "/integrations/stripe",
          permanent: true,
        },
      ];
    },
  })
);
