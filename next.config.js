/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_API_URL: 'https://amessages.onrender.com',
        NEXT_PUBLIC_SOCKET_URL: 'https://amessages.onrender.com',
    },
    images: {
        domains: [
            "icecast.walmradio.com"
        ],
    },
}

module.exports = nextConfig; 