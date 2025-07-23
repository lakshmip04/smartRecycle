import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }
    // Add admin role verification here
    try {
        const users = await prisma.user.findMany({
            where: { role: 'HOUSEHOLD' },
            include: { householdProfile: true }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
}