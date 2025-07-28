import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end();
    }

    try {
        // In a real app, you would add admin role verification here for security.

        const collectors = await prisma.user.findMany({
            where: { role: 'COLLECTOR' },
            include: { collectorProfile: true }
        });
        
        // This filters to only show collectors who are NOT yet verified.
        const pendingCollectors = collectors.filter(c => !c.collectorProfile?.isVerified);
        
        res.status(200).json(pendingCollectors);
    } catch (error) {
        console.error("Error in /api/admin/collectors:", error);
        res.status(500).json({ message: 'Failed to fetch collectors' });
    }
}
