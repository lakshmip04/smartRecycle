import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { alertId } = req.query;
    const { description, reportedById } = req.body;

    // --- 1. Input Validation ---
    if (!alertId || !description || !reportedById) {
      return res.status(400).json({ message: 'Alert ID, description, and reporter ID are required.' });
    }

    // --- 2. Verify that the alert exists ---
    const alert = await prisma.wasteAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return res.status(404).json({ message: 'Waste alert not found.' });
    }
    
    // --- 3. Create the Problem Report ---
    const newReport = await prisma.problemReport.create({
      data: {
        description,
        alertId,
        reportedById,
        // The status defaults to 'OPEN' as defined in the schema
      },
    });

    // --- 4. Return Success Response ---
    res.status(201).json({ message: 'Problem reported successfully!', report: newReport });

  } catch (error) {
    console.error("Report Problem Error:", error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
