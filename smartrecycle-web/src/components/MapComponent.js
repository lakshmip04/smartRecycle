import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

// --- Leaflet Icon Setup (Client-Side Only) ---
// This code needs to run in the browser, which is why it's in this component.
const setupLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
        iconUrl: require('leaflet/dist/images/marker-icon.png').default,
        shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    });
};

const collectorIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
});

const userRequestIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3412/3412414.png',
    iconSize: [25, 25],
});
// --- End of Icon Setup ---


// A helper component to control the map from outside
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
};


export default function MapComponent({ userRequests, onMarkerClick }) {
    const [collectorLocation, setCollectorLocation] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        setupLeafletIcons(); // Run the icon setup
        
        // Get collector's current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCollectorLocation([latitude, longitude]);
            },
            () => {
                console.warn('Could not get user location.');
            }
        );
    }, []);

    const mapCenter = collectorLocation || [12.9716, 77.5946]; // Default to Bengaluru

    return (
        <Card elevation={3}>
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: '600px', position: 'relative' }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={mapCenter} />

                        {/* Collector marker */}
                        {collectorLocation && (
                            <Marker position={collectorLocation} icon={collectorIcon}>
                                <Popup>You are here.</Popup>
                            </Marker>
                        )}

                        {/* User request markers */}
                        {userRequests.map((request) => (
                            <Marker
                                key={request.id}
                                position={[request.pickupLatitude, request.pickupLongitude]}
                                icon={userRequestIcon}
                            >
                                <Popup>
                                    <Typography variant="subtitle2">{request.wasteType}</Typography>
                                    <Typography variant="body2">{request.pickupAddress}</Typography>
                                    <Button size="small" onClick={() => onMarkerClick(request)} sx={{ mt: 1 }}>
                                        View Details
                                    </Button>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Box>
            </CardContent>
        </Card>
    );
}
