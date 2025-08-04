import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end();
    }

    try {
        // In a real app, you would add admin role verification here for security.

        const users = await prisma.user.findMany({
            where: { role: 'HOUSEHOLD' },
            include: { householdProfile: true }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in /api/admin/users:", error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
}
