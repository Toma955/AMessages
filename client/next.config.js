const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*'
            }
        ]
    },
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