import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  try {
    // Fetch all users with the role 'COLLECTOR'
    const collectors = await prisma.user.findMany({
      where: {
        role: 'COLLECTOR',
        // We only want to show collectors who have been verified by an admin
        collectorProfile: {
          isVerified: true,
        },
      },
      // Include the detailed profile information
      include: {
        collectorProfile: true,
      },
    });

    res.status(200).json({ collectors });
  } catch (error) {
    console.error('Failed to fetch collectors:', error);
    res.status(500).json({ message: 'An error occurred while fetching collectors.' });
  }
}