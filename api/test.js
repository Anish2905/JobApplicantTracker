// Test endpoint to check if everything is working
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const status = {
        tursoUrl: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
        tursoToken: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET',
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'USING DEFAULT',
        nodeVersion: process.version
    };

    res.json({ status, message: 'API is working' });
};
