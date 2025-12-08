import { InvoiceItem, TemplateBlock, DocType, Client, DocumentData } from '../types';
import { PLUMBING_TEMPLATES } from './plumbingData';
import { MECHANIC_TEMPLATES } from './mechanicData';
import { CATERING_TEMPLATES } from './cateringData';
import { NORTHCELL_STUDIOS_TEMPLATES } from './webDevelopmentData';

export const INDUSTRIES = [
  'Plumber',
  'Mechanic',
  'Catering',
  'Carpenter',
  'Construction',
  'Web Development'
];

// Helper to generate massive item lists for 5-page invoices
const generateMassiveItems = (industry: string): InvoiceItem[] => {
  const items: InvoiceItem[] = [];
  const baseItems = {
    'Plumber': [
      { desc: 'Copper Pipe 15mm (Class 0)', price: 45, unit: 'm' },
      { desc: 'Elbow Joint 15mm', price: 12, unit: 'ea' },
      { desc: 'Solder Ring', price: 5, unit: 'ea' },
      { desc: 'Labor: Rough-in', price: 450, unit: 'hrs' },
      { desc: 'Labor: Finishing', price: 450, unit: 'hrs' },
      { desc: 'Safety Valve Pressure Test', price: 150, unit: 'ea' },
      { desc: 'Geyser Installation Kit', price: 850, unit: 'set' },
      { desc: 'Flux & Solder Consumables', price: 120, unit: 'lot' }
    ],
    'Mechanic': [
      { desc: 'Synthetic Oil 5W-30', price: 180, unit: 'L' },
      { desc: 'Oil Filter (OEM)', price: 250, unit: 'ea' },
      { desc: 'Brake Pads (Front Set)', price: 890, unit: 'set' },
      { desc: 'Brake Discs Skimming', price: 450, unit: 'ea' },
      { desc: 'Labor: Service', price: 650, unit: 'hrs' },
      { desc: 'Diagnostic Scan', price: 550, unit: 'ea' },
      { desc: 'Spark Plugs (Iridium)', price: 220, unit: 'ea' },
      { desc: 'Windscreen Washer Fluid', price: 45, unit: 'ea' }
    ],
    'Catering': [
      { desc: 'Platter: Savory Mix', price: 450, unit: 'ea' },
      { desc: 'Platter: Sweet Treats', price: 380, unit: 'ea' },
      { desc: 'Waitstaff Service', price: 120, unit: 'hrs' },
      { desc: 'Chafing Dish Rental', price: 150, unit: 'ea' },
      { desc: 'Cutlery & Crockery Set', price: 15, unit: 'set' },
      { desc: 'Delivery & Setup', price: 550, unit: 'ea' },
      { desc: 'Beverage Station', price: 1200, unit: 'ea' },
      { desc: 'Ice Bags (5kg)', price: 25, unit: 'ea' }
    ],
    'Carpenter': [
      { desc: 'Meranti Timber 22x144', price: 180, unit: 'm' },
      { desc: 'Wood Glue (Industrial)', price: 120, unit: 'L' },
      { desc: 'Labor: Joinery', price: 550, unit: 'hrs' },
      { desc: 'Varnish (Marine Grade)', price: 350, unit: 'L' },
      { desc: 'Sandpaper Consumables', price: 85, unit: 'lot' },
      { desc: 'Hinges (Brass)', price: 65, unit: 'ea' },
      { desc: 'Handles (Brushed Steel)', price: 120, unit: 'ea' },
      { desc: 'Installation', price: 550, unit: 'hrs' }
    ],
    'Construction': [
      { desc: 'Cement (50kg Strength)', price: 110, unit: 'bag' },
      { desc: 'Building Sand', price: 850, unit: 'm3' },
      { desc: 'Bricks (Clay Stock)', price: 3.5, unit: 'ea' },
      { desc: 'Labor: Bricklaying', price: 350, unit: 'hrs' },
      { desc: 'Labor: General', price: 250, unit: 'hrs' },
      { desc: 'Scaffolding Rental', price: 1200, unit: 'day' },
      { desc: 'Safety Netting', price: 450, unit: 'm' },
      { desc: 'Site Clearing', price: 2500, unit: 'lot' }
    ]
  };

  const industryItems = baseItems[industry as keyof typeof baseItems] || baseItems['Plumber'];
  
  // Generate 80 items to ensure 5 pages
  for (let i = 0; i < 80; i++) {
    const template = industryItems[i % industryItems.length];
    items.push({
      id: `item_${i}_${Date.now()}`,
      description: `${template.desc} - Batch ${Math.floor(i / 8) + 1} (Ref: ${Math.random().toString(36).substring(7).toUpperCase()})`,
      quantity: Math.floor(Math.random() * 10) + 1,
      unitType: template.unit,
      price: template.price
    });
  }

  return items;
};

export const getIndustryTemplates = (industry: string): TemplateBlock[] => {
  // Return industry-specific templates
  if (industry === 'Plumber') {
    return PLUMBING_TEMPLATES;
  }
  
  if (industry === 'Mechanic') {
    return MECHANIC_TEMPLATES;
  }
  
  if (industry === 'Catering') {
    return CATERING_TEMPLATES;
  }
  
  if (industry === 'Web Development') {
    return NORTHCELL_STUDIOS_TEMPLATES;
  }
  
  // Default templates for other industries
  const templates: TemplateBlock[] = [];
  
  // 1. Standard Service Block
  templates.push({
    id: `temp_${industry}_1`,
    name: `${industry} Standard Service`,
    category: 'Services',
    type: DocType.INVOICE,
    items: [
      { id: '1', description: `Standard ${industry} Call-out Fee`, quantity: 1, unitType: 'ea', price: 550 },
      { id: '2', description: 'Labor Rate (Standard Hour)', quantity: 1, unitType: 'hrs', price: 450 }
    ]
  });

  // 2. Materials Block
  templates.push({
    id: `temp_${industry}_2`,
    name: `${industry} Materials Pack`,
    category: 'Materials',
    type: DocType.INVOICE,
    items: [
      { id: '3', description: 'Consumables & Sundries', quantity: 1, unitType: 'lot', price: 150 },
      { id: '4', description: 'Safety Equipment Surcharge', quantity: 1, unitType: 'ea', price: 85 }
    ]
  });

  // 3. Contract Clause
  templates.push({
    id: `temp_${industry}_3`,
    name: `${industry} Liability Waiver`,
    category: 'Legal',
    type: DocType.CONTRACT,
    clause: {
      id: 'c1',
      title: 'Liability Limitation',
      content: `The ${industry} shall not be liable for any pre-existing damage to the property or defects in materials supplied by the Client. Warranty on workmanship is valid for 6 months.`
    }
  });

  return templates;
};

export const getIndustryExampleInvoice = (industry: string, profileName: string): DocumentData => {
  const items = generateMassiveItems(industry);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT

  return {
    id: 'DEMO-5PAGE-001',
    type: DocType.INVOICE,
    status: 'Draft',
    title: `Comprehensive ${industry} Project (5-Page Demo)`,
    client: {
      id: 'demo_client',
      businessName: 'MegaCorp Developments',
      email: 'accounts@megacorp.demo',
      address: '123 Skyscraper Ave, Sandton, 2196',
      registrationNumber: '2025/123456/07'
    },
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'R',
    items: items,
    subtotal: subtotal,
    taxTotal: tax,
    total: subtotal + tax,
    vat_enabled: true,
    tax_rate: 15,
    notes: `This is a demonstration of a comprehensive 5-page invoice for the ${industry} industry. It contains ${items.length} line items to test pagination and performance.`
  };
};
