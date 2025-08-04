import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma'; // The number of '../' might change based on the file's location

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  try {
    // --- Chart 1: Waste Collected by Type (Weight) ---
    const wasteByType = await prisma.wasteAlert.groupBy({
      by: ['wasteType'],
      _sum: { weightEstimate: true },
      where: { status: 'COMPLETED' },
    });
    const formattedWasteData = wasteByType.map(item => ({
      name: item.wasteType.replace('_', ' '),
      weight: item._sum.weightEstimate || 0,
    }));

    // --- Chart 2: Collector Specializations ---
    const collectorProfiles = await prisma.collectorProfile.findMany({
      select: { acceptedWasteTypes: true },
    });
    const typeCounts = {};
    collectorProfiles.forEach(profile => {
        profile.acceptedWasteTypes.forEach(type => {
            const formattedType = type.replace('_', ' ');
            typeCounts[formattedType] = (typeCounts[formattedType] || 0) + 1;
        });
    });
    const collectorSpecializationData = Object.entries(typeCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // --- Chart 3: Alerts Created Over the Last 30 Days ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const alertsOverTime = await prisma.wasteAlert.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
    });
    // Format data for the line chart
    const activityData = alertsOverTime.reduce((acc, record) => {
        const date = new Date(record.createdAt).toISOString().split('T')[0];
        const entry = acc.find(e => e.date === date);
        if (entry) {
            entry.alerts += record._count.id;
        } else {
            acc.push({ date, alerts: record._count.id });
        }
        return acc;
    }, []);


    res.status(200).json({
      wasteByType: formattedWasteData,
      collectorSpecializations: collectorSpecializationData,
      dailyActivity: activityData,
    });

  } catch (error) {
    console.error("Error in /api/admin/analytics:", error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
}
