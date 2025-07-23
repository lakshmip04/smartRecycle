import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  // In a real app, you'd add admin role verification here
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'HOUSEHOLD' } });
    const totalCollectors = await prisma.user.count({ where: { role: 'COLLECTOR' } });
    const materialsCollected = await prisma.wasteAlert.count({ where: { status: 'COMPLETED' } });
    // This is a simplified weight calculation
    const totalWeightResult = await prisma.wasteAlert.aggregate({
      _sum: { weightEstimate: true },
      where: { status: 'COMPLETED' },
    });

    res.status(200).json({
      totalUsers,
      totalCollectors,
      materialsCollected,
      totalWeight: totalWeightResult._sum.weightEstimate || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}