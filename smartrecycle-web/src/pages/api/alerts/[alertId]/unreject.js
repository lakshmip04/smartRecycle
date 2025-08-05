import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { alertId } = req.query;
    const { collectorId } = req.body; // This is the User ID

    if (!alertId || !collectorId) {
      return res.status(400).json({ message: 'Alert ID and Collector ID are required.' });
    }

    // Find the collector's profile ID
    const collectorProfile = await prisma.collectorProfile.findUnique({
        where: { userId: collectorId },
        select: { id: true }
    });

    if (!collectorProfile) {
        return res.status(404).json({ message: 'Collector profile not found.' });
    }

    // Find and delete the specific rejection record
    await prisma.alertRejection.delete({
      where: {
        alertId_collectorId: { // This is the unique compound key we defined in the schema
          alertId: alertId,
          collectorId: collectorProfile.id,
        },
      },
    });

    res.status(200).json({ message: 'Alert un-rejected successfully.' });

  } catch (error) {
    console.error("Un-reject Alert Error:", error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
