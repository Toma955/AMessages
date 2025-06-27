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
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses source map upload logs during build
    org: "your-org-name",
    project: "amessages",
};

// Make sure adding Sentry options is the last code in this file!
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions); 