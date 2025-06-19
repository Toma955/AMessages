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

module.exports = nextConfig 