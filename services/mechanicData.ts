
import { TemplateBlock, DocType } from '../types';

export const MECHANIC_TEMPLATES: TemplateBlock[] = [
  {
    id: 'mech-diag-1',
    name: '1. DIAGNOSTICS & INSPECTION',
    category: 'Diagnostics',
    type: DocType.INVOICE,
    items: [
      { id: 'd1', description: 'OBD-II Computer Diagnostic Scan (Read & Clear Error Codes)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'd2', description: 'Advanced Fault Finding & Circuit Tracing (Per Hour)', quantity: 1, unitType: 'hrs', price: 850 },
      { id: 'd3', description: 'Compression Test (Petrol - 4 Cylinder)', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'd4', description: 'Fuel Pressure Test', quantity: 1, unitType: 'ea', price: 450 },
      { id: 'd5', description: 'Cooling System Pressure Test (Leak Detection)', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'd6', description: 'Pre-Purchase Vehicle Inspection (100-point check)', quantity: 1, unitType: 'ea', price: 1200 },
      { id: 'd7', description: 'Battery and Alternator Load Test', quantity: 1, unitType: 'ea', price: 150 },
    ]
  },
  {
    id: 'mech-service-2',
    name: '2. ROUTINE SERVICE & MAINTENANCE',
    category: 'Service & Maintenance',
    type: DocType.INVOICE,
    items: [
      // 2.1 FLUIDS & FILTERS
      { id: 'sf1', description: 'Labour: Minor Service (Oil & Oil Filter change + Check over)', quantity: 1, unitType: 'ea', price: 950 },
      { id: 'sf2', description: 'Labour: Major Service (Plugs, All Filters, Oil + Check over)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'sf3', description: 'Engine Oil: 5W30 Fully Synthetic (5 Litres)', quantity: 1, unitType: 'ea', price: 850 },
      { id: 'sf4', description: 'Engine Oil: 10W40 Semi-Synthetic (5 Litres)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'sf5', description: 'Oil Filter (Generic OEM Spec)', quantity: 1, unitType: 'ea', price: 180 },
      { id: 'sf6', description: 'Air Filter (Standard Panel)', quantity: 1, unitType: 'ea', price: 250 },
      { id: 'sf7', description: 'Cabin / Pollen Filter (Activated Charcoal)', quantity: 1, unitType: 'ea', price: 380 },
      { id: 'sf8', description: 'Fuel Filter (In-line Petrol)', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'sf9', description: 'Fuel Filter (Diesel Cartridge)', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'sf10', description: 'Spark Plugs: Standard Copper (Set of 4)', quantity: 1, unitType: 'set', price: 320 },
      { id: 'sf11', description: 'Spark Plugs: Iridium/Platinum Long Life (Set of 4)', quantity: 1, unitType: 'set', price: 1400 },
    ]
  },
  {
    id: 'mech-brakes-3',
    name: '3. BRAKING SYSTEM',
    category: 'Brakes',
    type: DocType.INVOICE,
    items: [
      // 3.1 FRONT BRAKES
      { id: 'fb1', description: 'Labour: Replace Front Brake Pads', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'fb2', description: 'Labour: Replace Front Discs and Pads', quantity: 1, unitType: 'ea', price: 950 },
      { id: 'fb3', description: 'Brake Pads Set (Front - Ceramic/Low Dust)', quantity: 1, unitType: 'set', price: 1200 },
      { id: 'fb4', description: 'Brake Pads Set (Front - Standard)', quantity: 1, unitType: 'set', price: 850 },
      { id: 'fb5', description: 'Brake Discs Vented (Front - Per Pair)', quantity: 1, unitType: 'set', price: 1800 },
      { id: 'fb6', description: 'Engineering: Skimming of Front Discs (Per Pair)', quantity: 1, unitType: 'set', price: 500 },
      // 3.2 REAR BRAKES
      { id: 'rb1', description: 'Labour: Replace Rear Brake Shoes (Drum Brakes)', quantity: 1, unitType: 'ea', price: 1100 },
      { id: 'rb2', description: 'Labour: Replace Rear Pads', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'rb3', description: 'Rear Brake Shoes Set', quantity: 1, unitType: 'set', price: 750 },
      { id: 'rb4', description: 'Rear Brake Drums (Per Pair)', quantity: 1, unitType: 'set', price: 1400 },
      { id: 'rb5', description: 'Wheel Cylinder Replacement (Per unit)', quantity: 1, unitType: 'ea', price: 450 },
      // 3.3 HYDRAULICS
      { id: 'bh1', description: 'Brake Fluid Flush and Bleed System (DOT 4)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'bh2', description: 'Master Cylinder Replacement (Labour)', quantity: 1, unitType: 'ea', price: 1200 },
    ]
  },
  {
    id: 'mech-suspension-4',
    name: '4. SUSPENSION & STEERING',
    category: 'Suspension & Steering',
    type: DocType.INVOICE,
    items: [
      { id: 'ss1', description: 'Wheel Alignment (3D 4-Wheel Alignment)', quantity: 1, unitType: 'ea', price: 450 },
      { id: 'ss2', description: 'Wheel Balancing (Per Wheel)', quantity: 4, unitType: 'ea', price: 80 },
      { id: 'ss3', description: 'Tyre Rotation', quantity: 1, unitType: 'ea', price: 150 },
      { id: 'ss4', description: 'Labour: Replace Shock Absorbers (Front - Per Pair)', quantity: 1, unitType: 'set', price: 1500 },
      { id: 'ss5', description: 'Labour: Replace Shock Absorbers (Rear - Per Pair)', quantity: 1, unitType: 'set', price: 950 },
      { id: 'ss6', description: 'Shock Absorbers MacPherson Strut (Front - Each)', quantity: 2, unitType: 'ea', price: 1850 },
      { id: 'ss7', description: 'Control Arm Lower (Includes Ball Joint & Bushes - Each)', quantity: 2, unitType: 'ea', price: 1650 },
      { id: 'ss8', description: 'Stabilizer Link / Drop Link (Each)', quantity: 2, unitType: 'ea', price: 350 },
      { id: 'ss9', description: 'Tie Rod End Replacement (Each)', quantity: 2, unitType: 'ea', price: 450 },
      { id: 'ss10', description: 'CV Joint Service: Outer CV Boot Replacement (Labour + Grease/Boot)', quantity: 1, unitType: 'ea', price: 850 },
      { id: 'ss11', description: 'Drive Shaft / CV Joint Complete (Reconditioned)', quantity: 1, unitType: 'ea', price: 1800 },
    ]
  },
  {
    id: 'mech-engine-5',
    name: '5. ENGINE & COOLING',
    category: 'Engine & Cooling',
    type: DocType.INVOICE,
    items: [
      // 5.1 CAMBELT / TIMING
      { id: 'ct1', description: 'Labour: Cambelt / Timing Chain Kit Installation (4 Cyl)', quantity: 1, unitType: 'ea', price: 3500 },
      { id: 'ct2', description: 'Timing Belt Kit (Belt + Tensioner)', quantity: 1, unitType: 'set', price: 1950 },
      { id: 'ct3', description: 'Water Pump Replacement (While stripping for cambelt)', quantity: 1, unitType: 'ea', price: 650 },
      // 5.2 COOLING
      { id: 'ec1', description: 'Coolant Flush and Refill (Long Life Antifreeze)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'ec2', description: 'Radiator Replacement (Labour)', quantity: 1, unitType: 'ea', price: 1200 },
      { id: 'ec3', description: 'Radiator Unit (Aluminium Core)', quantity: 1, unitType: 'ea', price: 2400 },
      { id: 'ec4', description: 'Thermostat Replacement (Housing + Unit)', quantity: 1, unitType: 'ea', price: 950 },
      { id: 'ec5', description: 'Expansion Tank Cap / Radiator Cap', quantity: 1, unitType: 'ea', price: 150 },
      // 5.3 GASKETS & SEALS
      { id: 'gs1', description: 'Rocker Cover Gasket Replacement (Labour)', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'gs2', description: 'Rocker Cover Gasket Part', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'gs3', description: 'Sump Gasket / Reseal (Labour + RTV Silicone)', quantity: 1, unitType: 'ea', price: 1100 },
      { id: 'gs4', description: 'Rear Main Seal Replacement (Requires Gearbox Removal)', quantity: 1, unitType: 'ea', price: 4500 },
    ]
  },
  {
    id: 'mech-clutch-6',
    name: '6. CLUTCH & TRANSMISSION',
    category: 'Clutch & Transmission',
    type: DocType.INVOICE,
    items: [
      { id: 'ct1', description: 'Labour: Clutch Kit Installation (FWD Vehicle)', quantity: 1, unitType: 'ea', price: 3800 },
      { id: 'ct2', description: 'Labour: Clutch Kit Installation (RWD/4x4 Vehicle)', quantity: 1, unitType: 'ea', price: 4800 },
      { id: 'ct3', description: 'Clutch Kit (Pressure Plate, Friction Plate, Release Bearing)', quantity: 1, unitType: 'set', price: 3200 },
      { id: 'ct4', description: 'Engineering: Flywheel Skimming', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'ct5', description: 'Dual Mass Flywheel (Replacement Part)', quantity: 1, unitType: 'ea', price: 8500 },
      { id: 'ct6', description: 'Gearbox Oil Change (75W90 - Includes Labour)', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'ct7', description: 'Automatic Transmission Fluid Flush (Machine Flush + Filter)', quantity: 1, unitType: 'ea', price: 2800 },
    ]
  },
  {
    id: 'mech-electrical-7',
    name: '7. ELECTRICAL & AIR CON',
    category: 'Electrical & Air Con',
    type: DocType.INVOICE,
    items: [
      { id: 'ea1', description: 'Air Con Regas (R134a Gas + Dye + Oil)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'ea2', description: 'Air Con Compressor Replacement (Labour)', quantity: 1, unitType: 'ea', price: 1500 },
      { id: 'ea3', description: 'Alternator Replacement (Labour)', quantity: 1, unitType: 'ea', price: 850 },
      { id: 'ea4', description: 'Alternator Unit (Reconditioned - Exchange)', quantity: 1, unitType: 'ea', price: 2200 },
      { id: 'ea5', description: 'Starter Motor Replacement (Labour)', quantity: 1, unitType: 'ea', price: 850 },
      { id: 'ea6', description: 'Starter Motor Unit (New)', quantity: 1, unitType: 'ea', price: 2800 },
      { id: 'ea7', description: 'Battery 652 (Willard/Sabat - 24 Month Warranty)', quantity: 1, unitType: 'ea', price: 1950 },
      { id: 'ea8', description: 'Headlight Bulb Replacement (H7/H4 - Labour)', quantity: 2, unitType: 'ea', price: 100 },
      { id: 'ea9', description: 'Globe H7 Night Breaker (Pair)', quantity: 1, unitType: 'set', price: 550 },
    ]
  },
];
