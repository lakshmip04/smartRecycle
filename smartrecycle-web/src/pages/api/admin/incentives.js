import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // In a real app, you would add admin role verification here for security.

  if (req.method === 'GET') {
    // --- Handle fetching all current incentive prices ---
    try {
      const incentives = await prisma.incentive.findMany({
        orderBy: {
          wasteType: 'asc',
        },
      });
      res.status(200).json(incentives);
    } catch (error) {
      console.error("Failed to fetch incentives:", error);
      res.status(500).json({ message: 'Failed to fetch incentive data.' });
    }

  } else if (req.method === 'POST') {
    // --- Handle updating or creating incentive prices ---
    try {
      const { updatedIncentives } = req.body;

      if (!Array.isArray(updatedIncentives)) {
        return res.status(400).json({ message: 'Request body must be an array of incentives.' });
      }

      // Use a transaction to update all prices at once
      const transaction = updatedIncentives.map(incentive => 
        prisma.incentive.upsert({
          where: { wasteType: incentive.wasteType },
          update: { pricePerKg: parseFloat(incentive.pricePerKg) },
          create: {
            wasteType: incentive.wasteType,
            pricePerKg: parseFloat(incentive.pricePerKg),
          },
        })
      );

      await prisma.$transaction(transaction);

      res.status(200).json({ message: 'Incentive prices updated successfully.' });

    } catch (error) {
      console.error("Failed to update incentives:", error);
      res.status(500).json({ message: 'Failed to update incentive prices.' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}