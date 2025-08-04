import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This function makes a real call to the Google Maps Directions API
async function getOptimizedRoute(
  start: { lat: number; lng: number },
  waypoints: { id: string; lat: number; lng: number }[]
) {
  // If there are no waypoints for a group, no need to call the API
  if (waypoints.length === 0) {
    return [];
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured.");
  }

  const origin = `${start.lat},${start.lng}`;
  const destination = origin; // Round trip
  const waypointsString = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypointsString}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error(`Google Maps API error: ${data.error_message || data.status}`);
  }

  const optimizedOrderIndexes = data.routes[0].waypoint_order;
  const optimizedWaypoints = optimizedOrderIndexes.map(index => waypoints[index]);
  
  return optimizedWaypoints;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { collectorId } = req.query;
    const { alertIds } = req.body;

    if (!collectorId || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({ message: 'Collector ID and a list of alert IDs are required.' });
    }

    // --- 1. Fetch Collector's Starting Location ---
    const collectorProfile = await prisma.collectorProfile.findUnique({
      where: { userId: collectorId as string },
    });

    if (!collectorProfile || !collectorProfile.latitude || !collectorProfile.longitude) {
      return res.status(404).json({ message: 'Collector profile not found or is missing location data.' });
    }

    // --- 2. Fetch Details for ALL Selected Alerts ---
    const alerts = await prisma.wasteAlert.findMany({
      where: {
        id: { in: alertIds },
        claimedById: collectorProfile.id,
        status: 'CLAIMED',
      },
    });

    if (alerts.length !== alertIds.length) {
        return res.status(404).json({ message: 'One or more alerts could not be found, do not belong to you, or are not in "CLAIMED" status.' });
    }

    // --- 3. Group Alerts by Time Slot ---
    const alertsByTimeSlot = alerts.reduce((acc, alert) => {
        const slot = alert.pickupTimeSlot || 'Unspecified';
        if (!acc[slot]) {
            acc[slot] = [];
        }
        acc[slot].push(alert);
        return acc;
    }, {} as Record<string, typeof alerts>);


    // --- 4. Optimize Route for EACH Time Slot Group ---
    const optimizedRoutesByTimeSlot = {};
    const startPoint = { lat: collectorProfile.latitude, lng: collectorProfile.longitude };

    for (const slot in alertsByTimeSlot) {
        const groupOfAlerts = alertsByTimeSlot[slot];
        
        const waypoints = groupOfAlerts.map(alert => ({
            id: alert.id,
            lat: alert.pickupLatitude,
            lng: alert.pickupLongitude,
        }));

        const optimizedWaypoints = await getOptimizedRoute(startPoint, waypoints);

        // Reorder the original alert objects based on the optimized result for this group
        const orderedAlerts = optimizedWaypoints.map(waypoint => {
            return groupOfAlerts.find(alert => alert.id === waypoint.id);
        });

        optimizedRoutesByTimeSlot[slot] = orderedAlerts;
    }


    // --- 5. Return the Grouped and Optimized Routes ---
    return res.status(200).json({
      message: 'Routes optimized successfully by time slot.',
      optimizedRoutes: optimizedRoutesByTimeSlot,
    });

  } catch (error: any) {
    console.error("Route Optimization Error:", error);
    return res.status(500).json({ message: error.message || 'An error occurred on the server.' });
  }
}
