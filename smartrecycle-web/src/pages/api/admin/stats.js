import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }
  
  try {
    // In a real app, you would add admin role verification here for security.
    
    const totalUsers = await prisma.user.count({ where: { role: 'HOUSEHOLD' } });
    const totalCollectors = await prisma.user.count({ where: { role: 'COLLECTOR' } });
    const materialsCollected = await prisma.wasteAlert.count({ where: { status: 'COMPLETED' } });
    
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
    console.error("Error in /api/admin/stats:", error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}
