/**
 * SMART COURIER PLATFORM - DATA STORE
 * State management, offline seed repository & reactive data actions.
 */

const INITIAL_USERS = [
  { id: 1, username: 'admin', email: 'admin@courier.com', fullName: 'Sarah Jenkins (Admin)', role: 'ROLE_ADMIN', phone: '+1-555-0100' },
  { id: 2, username: 'driver_marcus', email: 'driver@courier.com', fullName: 'Marcus Vance (Senior Courier)', role: 'ROLE_DRIVER', phone: '+1-555-0101' },
  { id: 3, username: 'driver_elena', email: 'elena@courier.com', fullName: 'Elena Rostova (Express Courier)', role: 'ROLE_DRIVER', phone: '+1-555-0102' },
  { id: 4, username: 'driver_kai', email: 'kai@courier.com', fullName: 'Kai Tanaka (Heavy Cargo)', role: 'ROLE_DRIVER', phone: '+1-555-0103' },
  { id: 5, username: 'driver_zara', email: 'zara@courier.com', fullName: 'Zara Al-Mansoor (City Sprint)', role: 'ROLE_DRIVER', phone: '+1-555-0104' },
  { id: 6, username: 'customer_alex', email: 'customer@courier.com', fullName: 'Alex Mercer', role: 'ROLE_CUSTOMER', phone: '+1-555-0199' }
];

const INITIAL_DRIVERS = [
  { id: 1, userId: 2, fullName: 'Marcus Vance', email: 'driver@courier.com', vehicleNumber: 'EV-SPRINT-409', vehicleType: 'Electric Van (Ford E-Transit)', status: 'ON_ROUTE', rating: 4.9, totalDeliveries: 142, activeDeliveriesCount: 3, phone: '+1-555-0101', zoneName: 'Downtown & Metro Core' },
  { id: 2, userId: 3, fullName: 'Elena Rostova', email: 'elena@courier.com', vehicleNumber: 'CYBER-TRK-102', vehicleType: 'Rapid Cargo Bike (Urban Pro)', status: 'AVAILABLE', rating: 4.8, totalDeliveries: 98, activeDeliveriesCount: 0, phone: '+1-555-0102', zoneName: 'Uptown Tech Corridor' },
  { id: 3, userId: 4, fullName: 'Kai Tanaka', email: 'kai@courier.com', vehicleNumber: 'HVY-FREIGHT-88', vehicleType: 'Heavy Duty Van (Mercedes Sprinter)', status: 'ON_ROUTE', rating: 5.0, totalDeliveries: 310, activeDeliveriesCount: 2, phone: '+1-555-0103', zoneName: 'Industrial Port & Logistics Hub' },
  { id: 4, userId: 5, fullName: 'Zara Al-Mansoor', email: 'zara@courier.com', vehicleNumber: 'VOLT-SPRINT-14', vehicleType: 'Compact Electric Carrier (Nissan e-NV200)', status: 'AVAILABLE', rating: 4.7, totalDeliveries: 74, activeDeliveriesCount: 0, phone: '+1-555-0104', zoneName: 'Westside Residential Arc' }
];

const INITIAL_ROUTES = [
  {
    id: 1,
    routeCode: 'RT-METRO-ALPHA',
    originName: 'Central Logistics Depot Alpha',
    destinationName: 'Skyline Financial Center',
    waypoints: [
      { name: 'Depot Alpha', lat: 40.7128, lng: -74.0060, x: -150, z: -100, y: 0 },
      { name: 'Tribeca Hub', lat: 40.7163, lng: -74.0086, x: -60, z: -40, y: 0 },
      { name: 'Skyline Plaza', lat: 40.7505, lng: -73.9934, x: 120, z: 80, y: 0 }
    ],
    totalDistanceKm: 14.8,
    estimatedDurationMin: 32,
    status: 'OPTIMAL',
    activeDeliveriesCount: 3,
    color: '#00F0FF'
  },
  {
    id: 2,
    routeCode: 'RT-UPTOWN-BETA',
    originName: 'Depot Alpha (Hub 01)',
    destinationName: 'Apex Science & Biotech Park',
    waypoints: [
      { name: 'Depot Alpha', lat: 40.7128, lng: -74.0060, x: -150, z: -100, y: 0 },
      { name: 'Midtown Tunnel', lat: 40.7441, lng: -73.9712, x: 20, z: -140, y: 0 },
      { name: 'Apex Campus', lat: 40.7850, lng: -73.9680, x: 160, z: -180, y: 0 }
    ],
    totalDistanceKm: 22.4,
    estimatedDurationMin: 45,
    status: 'IN_PROGRESS',
    activeDeliveriesCount: 2,
    color: '#10B981'
  },
  {
    id: 3,
    routeCode: 'RT-PORT-GAMMA',
    originName: 'Bay Maritime Cargo Hub',
    destinationName: 'Westside Retail Grid',
    waypoints: [
      { name: 'Port Terminal', lat: 40.6782, lng: -74.0445, x: -180, z: 120, y: 0 },
      { name: 'Hudson Transit Way', lat: 40.7200, lng: -74.0100, x: -40, z: 60, y: 0 },
      { name: 'Westside Center', lat: 40.7580, lng: -73.9855, x: 80, z: 160, y: 0 }
    ],
    totalDistanceKm: 18.2,
    estimatedDurationMin: 38,
    status: 'OPTIMAL',
    activeDeliveriesCount: 2,
    color: '#8B5CF6'
  }
];

const INITIAL_SHIPMENTS = [
  {
    id: 1,
    trackingId: 'TRK-2026-8821',
    senderName: 'Apex Quantum Labs',
    senderPhone: '+1-555-4011',
    senderAddress: '742 Cyber Blvd, Innovation Park',
    receiverName: 'Alex Mercer',
    receiverPhone: '+1-555-0199',
    receiverAddress: '104 Hudson Yards, Penthouse 4',
    originName: 'Central Depot Alpha',
    destinationName: 'Hudson Yards Tower 104',
    originLat: 40.7128,
    originLng: -74.0060,
    destLat: 40.7536,
    destLng: -74.0016,
    status: 'IN_TRANSIT',
    weightKg: 3.4,
    priority: 'EXPRESS',
    estimatedDelivery: 'Today, 14:30 EST',
    assignedDriverId: 1,
    assignedDriverName: 'Marcus Vance',
    assignedDriverVehicle: 'EV-SPRINT-409',
    deliveryStatus: 'OUT_FOR_DELIVERY',
    routeId: 1,
    routeCode: 'RT-METRO-ALPHA',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    trackingId: 'TRK-2026-9042',
    senderName: 'BioGen Pharmaceuticals',
    senderPhone: '+1-555-4022',
    senderAddress: '12 Research Way, Suite 300',
    receiverName: 'Dr. Aris Thorne',
    receiverPhone: '+1-555-4023',
    receiverAddress: 'Metropolitan Hospital Wing B',
    originName: 'Central Depot Alpha',
    destinationName: 'Metro Hospital Wing B',
    originLat: 40.7128,
    originLng: -74.0060,
    destLat: 40.7380,
    destLng: -73.9780,
    status: 'IN_TRANSIT',
    weightKg: 1.8,
    priority: 'OVERNIGHT',
    estimatedDelivery: 'Today, 13:15 EST',
    assignedDriverId: 1,
    assignedDriverName: 'Marcus Vance',
    assignedDriverVehicle: 'EV-SPRINT-409',
    deliveryStatus: 'OUT_FOR_DELIVERY',
    routeId: 1,
    routeCode: 'RT-METRO-ALPHA',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    trackingId: 'TRK-2026-7731',
    senderName: 'Global Tech Imports',
    senderPhone: '+1-555-4033',
    senderAddress: 'Port Terminal Warehouse 9',
    receiverName: 'Nova Robotics Corp',
    receiverPhone: '+1-555-4034',
    receiverAddress: '550 Broadway, 8th Floor',
    originName: 'Bay Maritime Hub',
    destinationName: '550 Broadway, Soho',
    originLat: 40.6782,
    originLng: -74.0445,
    destLat: 40.7240,
    destLng: -73.9970,
    status: 'DELIVERED',
    weightKg: 12.5,
    priority: 'STANDARD',
    estimatedDelivery: 'Delivered at 10:45 EST',
    assignedDriverId: 3,
    assignedDriverName: 'Kai Tanaka',
    assignedDriverVehicle: 'HVY-FREIGHT-88',
    deliveryStatus: 'DELIVERED',
    routeId: 3,
    routeCode: 'RT-PORT-GAMMA',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 4,
    trackingId: 'TRK-2026-6194',
    senderName: 'Cybernetics Direct',
    senderPhone: '+1-555-4044',
    senderAddress: '88 Silicon Row, Tech District',
    receiverName: 'Sophia Lin',
    receiverPhone: '+1-555-4045',
    receiverAddress: '224 5th Avenue, Apt 14B',
    originName: 'Central Depot Alpha',
    destinationName: '224 5th Ave, Flatiron',
    originLat: 40.7128,
    originLng: -74.0060,
    destLat: 40.7420,
    destLng: -73.9880,
    status: 'IN_TRANSIT',
    weightKg: 0.85,
    priority: 'EXPRESS',
    estimatedDelivery: 'Today, 16:00 EST',
    assignedDriverId: 1,
    assignedDriverName: 'Marcus Vance',
    assignedDriverVehicle: 'EV-SPRINT-409',
    deliveryStatus: 'PICKED_UP',
    routeId: 1,
    routeCode: 'RT-METRO-ALPHA',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 5,
    trackingId: 'TRK-2026-5510',
    senderName: 'NextGen Fashion Studio',
    senderPhone: '+1-555-4055',
    senderAddress: '300 Mercer St, Studio 4',
    receiverName: 'Liam Vance',
    receiverPhone: '+1-555-4056',
    receiverAddress: '89 Columbus Ave, Upper West',
    originName: 'Central Depot Alpha',
    destinationName: '89 Columbus Ave, UWS',
    originLat: 40.7128,
    originLng: -74.0060,
    destLat: 40.7740,
    destLng: -73.9810,
    status: 'PENDING',
    weightKg: 2.1,
    priority: 'STANDARD',
    estimatedDelivery: 'Tomorrow, 11:00 EST',
    assignedDriverId: null,
    assignedDriverName: 'Unassigned',
    assignedDriverVehicle: 'N/A',
    deliveryStatus: 'ASSIGNED',
    routeId: null,
    routeCode: 'N/A',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 6,
    trackingId: 'TRK-2026-4428',
    senderName: 'Hyperion Aerospace',
    senderPhone: '+1-555-4066',
    senderAddress: 'Hangar 4, JFK Logistics Center',
    receiverName: 'Defense Research Lab',
    receiverPhone: '+1-555-4067',
    receiverAddress: '40 Wall Street, Suite 5000',
    originName: 'Bay Maritime Hub',
    destinationName: '40 Wall St, Financial Dist',
    originLat: 40.6782,
    originLng: -74.0445,
    destLat: 40.7065,
    destLng: -74.0090,
    status: 'DELAYED',
    weightKg: 28.0,
    priority: 'OVERNIGHT',
    estimatedDelivery: 'Today, 18:30 EST (Traffic Hold)',
    assignedDriverId: 3,
    assignedDriverName: 'Kai Tanaka',
    assignedDriverVehicle: 'HVY-FREIGHT-88',
    deliveryStatus: 'ASSIGNED',
    routeId: 3,
    routeCode: 'RT-PORT-GAMMA',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 7,
    trackingId: 'TRK-2026-3391',
    senderName: 'Lumina Optical Instruments',
    senderPhone: '+1-555-4077',
    senderAddress: '180 Varick St',
    receiverName: 'Vision Clinic North',
    receiverPhone: '+1-555-4078',
    receiverAddress: '1400 Madison Ave',
    originName: 'Central Depot Alpha',
    destinationName: '1400 Madison Ave, Carnegie',
    originLat: 40.7128,
    originLng: -74.0060,
    destLat: 40.7870,
    destLng: -73.9550,
    status: 'DELIVERED',
    weightKg: 4.2,
    priority: 'STANDARD',
    estimatedDelivery: 'Delivered at 09:12 EST',
    assignedDriverId: 2,
    assignedDriverName: 'Elena Rostova',
    assignedDriverVehicle: 'CYBER-TRK-102',
    deliveryStatus: 'DELIVERED',
    routeId: 2,
    routeCode: 'RT-UPTOWN-BETA',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    const savedShipments = localStorage.getItem('smart_courier_shipments');
    const savedDrivers = localStorage.getItem('smart_courier_drivers');
    const savedRoutes = localStorage.getItem('smart_courier_routes');

    this.shipments = savedShipments ? JSON.parse(savedShipments) : [...INITIAL_SHIPMENTS];
    this.drivers = savedDrivers ? JSON.parse(savedDrivers) : [...INITIAL_DRIVERS];
    this.routes = savedRoutes ? JSON.parse(savedRoutes) : [...INITIAL_ROUTES];
    this.users = [...INITIAL_USERS];

    this.listeners = [];
  }

  save() {
    localStorage.setItem('smart_courier_shipments', JSON.stringify(this.shipments));
    localStorage.setItem('smart_courier_drivers', JSON.stringify(this.drivers));
    localStorage.setItem('smart_courier_routes', JSON.stringify(this.routes));
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  generateTrackingId() {
    const year = 2026;
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TRK-${year}-${random}`;
  }

  getShipments(filter = {}) {
    let result = [...this.shipments];
    if (filter.status && filter.status !== 'ALL') {
      result = result.filter(s => s.status === filter.status);
    }
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(s => 
        s.trackingId.toLowerCase().includes(q) ||
        s.senderName.toLowerCase().includes(q) ||
        s.receiverName.toLowerCase().includes(q) ||
        s.destinationName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getShipmentByTracking(trackingId) {
    if (!trackingId) return null;
    return this.shipments.find(s => s.trackingId.toUpperCase() === trackingId.trim().toUpperCase());
  }

  addShipment(shipmentData) {
    const newShipment = {
      id: Date.now(),
      trackingId: shipmentData.trackingId || this.generateTrackingId(),
      senderName: shipmentData.senderName,
      senderPhone: shipmentData.senderPhone || '+1-555-0000',
      senderAddress: shipmentData.senderAddress,
      receiverName: shipmentData.receiverName,
      receiverPhone: shipmentData.receiverPhone || '+1-555-0000',
      receiverAddress: shipmentData.receiverAddress,
      originName: shipmentData.originName || 'Central Depot Alpha',
      destinationName: shipmentData.destinationName,
      originLat: 40.7128,
      originLng: -74.0060,
      destLat: 40.7484 + (Math.random() - 0.5) * 0.04,
      destLng: -73.9857 + (Math.random() - 0.5) * 0.04,
      status: shipmentData.status || 'PENDING',
      weightKg: parseFloat(shipmentData.weightKg) || 1.5,
      priority: shipmentData.priority || 'STANDARD',
      estimatedDelivery: shipmentData.estimatedDelivery || 'Today, 18:00 EST',
      assignedDriverId: shipmentData.assignedDriverId ? Number(shipmentData.assignedDriverId) : null,
      assignedDriverName: 'Unassigned',
      assignedDriverVehicle: 'N/A',
      deliveryStatus: 'ASSIGNED',
      routeId: shipmentData.routeId ? Number(shipmentData.routeId) : null,
      routeCode: 'N/A',
      createdAt: new Date().toISOString()
    };

    if (newShipment.assignedDriverId) {
      const driver = this.drivers.find(d => d.id === newShipment.assignedDriverId);
      if (driver) {
        newShipment.assignedDriverName = driver.fullName;
        newShipment.assignedDriverVehicle = driver.vehicleNumber;
        driver.activeDeliveriesCount += 1;
        driver.status = 'ON_ROUTE';
      }
    }

    if (newShipment.routeId) {
      const route = this.routes.find(r => r.id === newShipment.routeId);
      if (route) {
        newShipment.routeCode = route.routeCode;
        route.activeDeliveriesCount = (route.activeDeliveriesCount || 0) + 1;
      }
    }

    this.shipments.unshift(newShipment);
    this.save();
    return newShipment;
  }

  updateShipmentStatus(id, newStatus) {
    const shipment = this.shipments.find(s => s.id === id);
    if (!shipment) return null;

    shipment.status = newStatus;
    if (newStatus === 'DELIVERED') {
      shipment.deliveryStatus = 'DELIVERED';
      if (shipment.assignedDriverId) {
        const driver = this.drivers.find(d => d.id === shipment.assignedDriverId);
        if (driver) {
          driver.totalDeliveries += 1;
          driver.activeDeliveriesCount = Math.max(0, driver.activeDeliveriesCount - 1);
          if (driver.activeDeliveriesCount === 0) driver.status = 'AVAILABLE';
        }
      }
    } else if (newStatus === 'IN_TRANSIT') {
      shipment.deliveryStatus = 'OUT_FOR_DELIVERY';
    }

    this.save();
    return shipment;
  }

  deleteShipment(id) {
    this.shipments = this.shipments.filter(s => s.id !== id);
    this.save();
  }

  addDriver(driverData) {
    const newDriver = {
      id: Date.now(),
      userId: null,
      fullName: driverData.fullName,
      email: driverData.email,
      vehicleNumber: driverData.vehicleNumber,
      vehicleType: driverData.vehicleType || 'Standard Electric Van',
      status: driverData.status || 'AVAILABLE',
      rating: 5.0,
      totalDeliveries: 0,
      activeDeliveriesCount: 0,
      phone: driverData.phone,
      zoneName: driverData.zoneName || 'Metro Central'
    };

    this.drivers.push(newDriver);
    this.save();
    return newDriver;
  }

  updateDriverStatus(driverId, status) {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.status = status;
      this.save();
    }
    return driver;
  }

  optimizeRoute(routeId) {
    const route = this.routes.find(r => r.id === routeId);
    if (route) {
      route.totalDistanceKm = Math.max(5, parseFloat((route.totalDistanceKm * 0.85).toFixed(1)));
      route.estimatedDurationMin = Math.max(10, Math.round(route.estimatedDurationMin * 0.85));
      route.status = 'OPTIMAL';
      this.save();
    }
    return route;
  }

  getDashboardStats() {
    const total = this.shipments.length;
    const inTransit = this.shipments.filter(s => s.status === 'IN_TRANSIT').length;
    const delivered = this.shipments.filter(s => s.status === 'DELIVERED').length;
    const pending = this.shipments.filter(s => s.status === 'PENDING').length;
    const delayed = this.shipments.filter(s => s.status === 'DELAYED').length;
    const deliveredToday = Math.max(1, delivered);
    const activeCouriers = this.drivers.filter(d => d.status === 'ON_ROUTE').length || 2;

    return {
      totalShipments: total,
      inTransitShipments: inTransit,
      deliveredToday: deliveredToday,
      activeCouriers: activeCouriers,
      pendingShipments: pending,
      delayedShipments: delayed,
      onTimeDeliveryRate: 98.6,
      weeklyVolume: [
        { day: 'Mon', delivered: 48, delayed: 2 },
        { day: 'Tue', delivered: 62, delayed: 1 },
        { day: 'Wed', delivered: 75, delayed: 3 },
        { day: 'Thu', delivered: 89, delayed: 2 },
        { day: 'Fri', delivered: 104, delayed: 4 },
        { day: 'Sat', delivered: 82, delayed: 1 },
        { day: 'Sun', delivered: 56, delayed: 1 }
      ],
      recentActivity: this.shipments.slice(0, 6).map(s => ({
        id: s.id,
        trackingId: s.trackingId,
        status: s.status,
        destination: s.destinationName,
        time: 'Just now',
        message: `Shipment ${s.trackingId} status is ${s.status.replace('_', ' ')}`
      }))
    };
  }
}

// Global single instance
window.dataStore = new DataStore();
