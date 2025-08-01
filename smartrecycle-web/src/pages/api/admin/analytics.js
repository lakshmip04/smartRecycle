import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  // In a real app, you would add admin role verification here for security.

  try {
    // --- Analytics 1: Waste Collected by Type ---
    // This query groups all completed alerts by their wasteType
    // and calculates the sum of the weightEstimate for each type.
    const wasteByType = await prisma.wasteAlert.groupBy({
      by: ['wasteType'],
      _sum: {
        weightEstimate: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    // The data from Prisma looks like: [{ wasteType: 'E_WASTE', _sum: { weightEstimate: 50 } }]
    // We need to format it for the charting library like: [{ name: 'E-Waste', weight: 50 }]
    const formattedWasteData = wasteByType.map(item => ({
      name: item.wasteType.replace('_', ' '), // Make it more readable
      weight: item._sum.weightEstimate || 0,
    }));


    // --- Analytics 2: User and Collector Growth Over Time (Example) ---
    // This is a more advanced query to show how you could track sign-ups over time.
    // For simplicity, we will just return the waste data for now.
    // In a real app, you could add more queries here for different charts.


    res.status(200).json({
      wasteByType: formattedWasteData,
      // You could add more analytics data here in the future
    });

  } catch (error) {
    console.error("Error in /api/admin/analytics:", error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
}
