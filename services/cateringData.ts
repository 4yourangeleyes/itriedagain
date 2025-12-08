
import { TemplateBlock, DocType } from '../types';

export const CATERING_TEMPLATES: TemplateBlock[] = [
  {
    id: 'cater-canapes-1',
    name: '1. FOOD: CANAPES & STARTERS',
    category: 'Canapes & Starters',
    type: DocType.INVOICE,
    items: [
      { id: 'cs1', description: 'Arrival Platters: Harvest Table (Cheeses, preserves, crackers, cured meats, fruits) - Per Person', quantity: 20, unitType: 'ea', price: 110 },
      { id: 'cs2', description: 'Canapes (Cold): Smoked Salmon & Cream Cheese Blini with Dill (Per Dozen)', quantity: 5, unitType: 'ea', price: 300 },
      { id: 'cs3', description: 'Canapes (Cold): Caprese Skewers with Balsamic Glaze (Per Dozen)', quantity: 5, unitType: 'ea', price: 240 },
      { id: 'cs4', description: 'Canapes (Hot): Mini Bobotie Springrolls with Chutney Dip (Per Dozen)', quantity: 5, unitType: 'ea', price: 260 },
      { id: 'cs5', description: 'Canapes (Hot): Sticky Pork Belly Bites with Sesame (Per Dozen)', quantity: 5, unitType: 'ea', price: 320 },
      { id: 'cs6', description: 'Canapes (Hot): Tempura Prawns with Sweet Chilli Mayo (Per Dozen)', quantity: 5, unitType: 'ea', price: 380 },
      { id: 'cs7', description: 'Plated Starter: Butternut & Coriander Soup with Artisan Bread', quantity: 20, unitType: 'ea', price: 75 },
      { id: 'cs8', description: 'Plated Starter: Carpaccio of Beef with Parmesan Shavings & Rocket', quantity: 20, unitType: 'ea', price: 115 },
    ]
  },
  {
    id: 'cater-mains-2',
    name: '2. FOOD: MAIN COURSE',
    category: 'Main Course',
    type: DocType.INVOICE,
    items: [
      // 2.1 BUFFET OPTION
      { id: 'mb1', description: 'Classic Buffet Package: (2 Meats, 2 Starches, 3 Salads) - Per Head', quantity: 50, unitType: 'ea', price: 350 },
      { id: 'mb2', description: 'Meat Option: Slow Roasted Lamb Shank in Red Wine Jus (Add-on)', quantity: 10, unitType: 'ea', price: 95 },
      // 2.2 PLATED SIT-DOWN
      { id: 'mp1', description: 'Main: 200g Fillet Steak, Fondant Potato, Wilted Spinach, Peppercorn Sauce', quantity: 30, unitType: 'ea', price: 280 },
      { id: 'mp2', description: 'Main: Kingklip Fillet, Lemon Butter Sauce, Mash, Asparagus', quantity: 15, unitType: 'ea', price: 260 },
      { id: 'mp3', description: 'Main (Veg): Wild Mushroom Risotto with Truffle Oil', quantity: 3, unitType: 'ea', price: 190 },
      { id: 'mp4', description: 'Main (Vegan): Chickpea & Lentil Curry with Basmati Rice', quantity: 2, unitType: 'ea', price: 170 },
      // 2.3 PLATTERS (Serves 8-10)
      { id: 'mpl1', description: 'Savory Meat Platter (Meatballs, Riblets, Chicken Wings, Sausages)', quantity: 3, unitType: 'ea', price: 850 },
      { id: 'mpl2', description: 'Sandwich Platter (Assorted fillings on White/Brown/Rye)', quantity: 3, unitType: 'ea', price: 550 },
      { id: 'mpl3', description: 'Vegetarian Platter (Samosas, Springrolls, Cheese puffs, Crudites)', quantity: 2, unitType: 'ea', price: 650 },
      { id: 'mpl4', description: 'Seafood Platter (Calamari, Hake nuggets, Prawns, Mussels)', quantity: 2, unitType: 'ea', price: 1200 },
    ]
  },
  {
    id: 'cater-desserts-3',
    name: '3. DESSERTS & CAKES',
    category: 'Desserts',
    type: DocType.INVOICE,
    items: [
      { id: 'dc1', description: 'Plated: Malva Pudding with Creme Anglaise', quantity: 50, unitType: 'ea', price: 75 },
      { id: 'dc2', description: 'Plated: Dark Chocolate Fondant with Vanilla Pod Ice Cream', quantity: 30, unitType: 'ea', price: 95 },
      { id: 'dc3', description: 'Plated: Deconstructed Lemon Meringue Tart', quantity: 20, unitType: 'ea', price: 85 },
      { id: 'dc4', description: 'Buffet: Mini Dessert Station (Petit Fours, Mini Milktarts, Brownies) - Per Head', quantity: 50, unitType: 'ea', price: 120 },
      { id: 'dc5', description: 'Cake: Custom Celebration Cake (Vanilla Sponge/Buttercream) - Per Tier', quantity: 2, unitType: 'ea', price: 1500 },
      { id: 'dc6', description: 'Cake Cutting & Serving Fee (If cake provided by client)', quantity: 1, unitType: 'ea', price: 450 },
    ]
  },
  {
    id: 'cater-beverages-4',
    name: '4. BEVERAGES & BAR',
    category: 'Beverages & Bar',
    type: DocType.INVOICE,
    items: [
      { id: 'bb1', description: 'Welcome Drinks: Freshly Squeezed Juice / Iced Tea (Dispenser 5L)', quantity: 3, unitType: 'ea', price: 350 },
      { id: 'bb2', description: 'Welcome Drinks: Sparkling Wine / Mimosa (Per Glass)', quantity: 50, unitType: 'ea', price: 65 },
      { id: 'bb3', description: 'Filter Coffee & Tea Station (Unlimited for 4 hours) - Per Head', quantity: 50, unitType: 'ea', price: 45 },
      { id: 'bb4', description: 'Soft Drinks 330ml (Coke, Sprite, Fanta, etc.)', quantity: 80, unitType: 'ea', price: 28 },
      { id: 'bb5', description: 'Water 500ml (Still/Sparkling)', quantity: 100, unitType: 'ea', price: 20 },
      { id: 'bb6', description: 'Corkage Fee (Per Bottle - Wine/Champagne)', quantity: 10, unitType: 'ea', price: 60 },
      { id: 'bb7', description: 'Ice (10kg Bag)', quantity: 3, unitType: 'ea', price: 40 },
      { id: 'bb8', description: 'Full Bar Setup Fee (Includes garnishes, ice buckets, mats, straws)', quantity: 1, unitType: 'ea', price: 1500 },
    ]
  },
  {
    id: 'cater-staffing-5',
    name: '5. STAFFING (LABOUR)',
    category: 'Staffing',
    type: DocType.INVOICE,
    items: [
      { id: 'st1', description: 'Event Coordinator / Floor Manager (Per Hour)', quantity: 6, unitType: 'hrs', price: 350 },
      { id: 'st2', description: 'Head Chef (Per Hour - Minimum 5 hours)', quantity: 5, unitType: 'hrs', price: 450 },
      { id: 'st3', description: 'Sous Chef / Grill Chef (Per Hour)', quantity: 6, unitType: 'hrs', price: 250 },
      { id: 'st4', description: 'Waiters / Servers (Per Hour - Minimum 4 hours)', quantity: 20, unitType: 'hrs', price: 120 },
      { id: 'st5', description: 'Barmen (Per Hour - Minimum 4 hours)', quantity: 8, unitType: 'hrs', price: 150 },
      { id: 'st6', description: 'Scullery / Cleaning Staff (Per Hour)', quantity: 12, unitType: 'hrs', price: 90 },
      { id: 'st7', description: 'Travel Allowance for Staff (Per vehicle / Late night)', quantity: 2, unitType: 'ea', price: 450 },
    ]
  },
  {
    id: 'cater-equipment-6',
    name: '6. EQUIPMENT HIRE & RENTALS',
    category: 'Equipment Hire',
    type: DocType.INVOICE,
    items: [
      // 6.1 FURNITURE
      { id: 'ef1', description: 'Tiffany Chairs (White/Gold/Clear) - Unit', quantity: 50, unitType: 'ea', price: 45 },
      { id: 'ef2', description: 'Wimbledon Chairs (White) - Unit', quantity: 50, unitType: 'ea', price: 35 },
      { id: 'ef3', description: 'Rectangular Trestle Table (1.8m - Seats 8)', quantity: 6, unitType: 'ea', price: 85 },
      { id: 'ef4', description: 'Round Banquet Table (1.8m - Seats 10)', quantity: 5, unitType: 'ea', price: 120 },
      { id: 'ef5', description: 'Cocktail Tables (Highboys)', quantity: 4, unitType: 'ea', price: 150 },
      // 6.2 LINEN & DECOR
      { id: 'ld1', description: 'Table Cloth (White/Black Damask - Rectangular)', quantity: 6, unitType: 'ea', price: 65 },
      { id: 'ld2', description: 'Table Cloth (Round - Floor length)', quantity: 5, unitType: 'ea', price: 95 },
      { id: 'ld3', description: 'Napkins (Linen - Assorted Colors)', quantity: 60, unitType: 'ea', price: 8 },
      { id: 'ld4', description: 'Table Runners (Hessian/Organza)', quantity: 8, unitType: 'ea', price: 35 },
      { id: 'ld5', description: 'Chair Covers (Stretch)', quantity: 50, unitType: 'ea', price: 15 },
      // 6.3 CUTLERY & CROCKERY
      { id: 'cc1', description: 'Dinner Plates (White Round Porcelain)', quantity: 60, unitType: 'ea', price: 4.50 },
      { id: 'cc2', description: 'Side Plates / Dessert Bowls', quantity: 60, unitType: 'ea', price: 3.50 },
      { id: 'cc3', description: 'Underplates (Glass/Gold/Silver Charger)', quantity: 50, unitType: 'ea', price: 15.00 },
      { id: 'cc4', description: 'Cutlery Set (Knife, Fork, Dessert Spoon - Stainless Steel)', quantity: 60, unitType: 'ea', price: 6.00 },
      { id: 'cc5', description: 'Cutlery Set (Gold/Rose Gold/Black)', quantity: 50, unitType: 'ea', price: 12.00 },
      { id: 'cc6', description: 'Glassware: Red/White Wine Glass', quantity: 100, unitType: 'ea', price: 4.50 },
      { id: 'cc7', description: 'Glassware: Champagne Flute', quantity: 60, unitType: 'ea', price: 4.50 },
      { id: 'cc8', description: 'Glassware: Hi-Ball / Tumbler', quantity: 80, unitType: 'ea', price: 3.50 },
      { id: 'cc9', description: 'Chafing Dish with Fuel (Buffet Warmer)', quantity: 6, unitType: 'ea', price: 250 },
    ]
  },
  {
    id: 'cater-logistics-7',
    name: '7. LOGISTICS & ADDITIONAL CHARGES',
    category: 'Logistics',
    type: DocType.INVOICE,
    items: [
      { id: 'lg1', description: 'Delivery & Collection Fee (0-20km radius)', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'lg2', description: 'Delivery Fee (Per km thereafter)', quantity: 15, unitType: 'ea', price: 12.50 },
      { id: 'lg3', description: 'Setup Fee (Setting tables, folding napkins, buffet setup)', quantity: 1, unitType: 'ea', price: 1800 },
      { id: 'lg4', description: 'Breakdown & Clearing Fee (Post-event)', quantity: 1, unitType: 'ea', price: 1200 },
      { id: 'lg5', description: 'Refuse Removal (Per bag/bin)', quantity: 5, unitType: 'ea', price: 50 },
      { id: 'lg6', description: 'Breakage Deposit (Refundable)', quantity: 1, unitType: 'ea', price: 2000 },
    ]
  },
];
