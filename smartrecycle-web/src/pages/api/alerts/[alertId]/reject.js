import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { alertId } = req.query;
    const { collectorId } = req.body; // This is the USER ID of the collector

    if (!alertId || !collectorId) {
      return res.status(400).json({ message: 'Alert ID and Collector ID are required.' });
    }

    // Find the collector's PROFILE id, which is needed for the relation
    const collectorProfile = await prisma.collectorProfile.findUnique({
        where: { userId: collectorId },
        select: { id: true }
    });

    if (!collectorProfile) {
        return res.status(404).json({ message: 'Collector profile not found.' });
    }

    // Create a new rejection record
    await prisma.alertRejection.create({
      data: {
        alertId: alertId,
        collectorId: collectorProfile.id,
      },
    });

    res.status(200).json({ message: 'Alert rejected successfully.' });

  } catch (error) {
    // P2002 is the Prisma code for a unique constraint violation
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Alert already rejected by this collector.' });
    }
    console.error("Reject Alert Error:", error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
