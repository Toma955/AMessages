const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: [
            "icecast.walmradio.com"
        ],
    },
}

const sentryWebpackPluginOptions = {
   

    silent: true, 
    org: "your-org-name",
    project: "amessages",
};


module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions); 