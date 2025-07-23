import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }
    // Add admin role verification here
    try {
        const collectors = await prisma.user.findMany({
            where: { role: 'COLLECTOR' },
            include: { collectorProfile: true }
        });
        // You can filter for unverified collectors by checking `collectorProfile.isVerified`
        const pendingCollectors = collectors.filter(c => !c.collectorProfile?.isVerified);
        res.status(200).json(pendingCollectors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch collectors' });
    }
}