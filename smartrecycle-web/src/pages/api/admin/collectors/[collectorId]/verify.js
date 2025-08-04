import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma'; // The number of '../' might change based on the file's location

export default async function handler(req, res) {
  const { collectorId } = req.query;

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // TODO: Add admin role verification here for security

  try {
    // Find the collector's profile using their main user ID
    const updatedProfile = await prisma.collectorProfile.update({
      where: {
        userId: collectorId,
      },
      data: {
        isVerified: true, // Set the verification flag to true
      },
    });

    res.status(200).json({ message: 'Collector approved successfully!', profile: updatedProfile });
  } catch (error) {
    console.error(`Failed to approve collector ${collectorId}:`, error);
    res.status(500).json({ message: 'Failed to approve collector.' });
  }
}
