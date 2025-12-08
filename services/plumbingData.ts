
import { TemplateBlock, DocType } from '../types';

export const PLUMBING_TEMPLATES: TemplateBlock[] = [
  {
    id: 'plumb-rem-1',
    name: '1. REMOVAL',
    category: 'Removal',
    type: DocType.INVOICE,
    items: [
      { id: 'r1', description: 'Removal of the wall hung toilet, concealed system', quantity: 1, unitType: 'ea', price: 1500 },
      { id: 'r2', description: 'Removal of the toilet', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'r3', description: 'Removal of the flush master mechanism', quantity: 1, unitType: 'ea', price: 1800 },
      { id: 'r4', description: 'Removal of the Freestanding Bathtub and bath mixer taps', quantity: 1, unitType: 'ea', price: 1150 },
      { id: 'r5', description: 'Removal of the Bathtub, bath mixer taps and wall under the bathtub', quantity: 1, unitType: 'ea', price: 2850 },
      { id: 'r6', description: 'Removal of the double basin', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'r7', description: 'Removal of the basin', quantity: 1, unitType: 'ea', price: 750 },
      { id: 'r8', description: 'Removal of the sink', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'r9', description: 'Removal of the double sink', quantity: 1, unitType: 'ea', price: 750 },
      { id: 'r10', description: 'Removal of the cupboards', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'r11', description: 'Removal of the single brick wall', quantity: 1, unitType: 'ea', price: 1800 },
      { id: 'r12', description: 'Removal of the double brick wall', quantity: 1, unitType: 'ea', price: 2500 },
      { id: 'r13', description: 'Removal of the false ceiling and downlights', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'r14', description: 'Removal of the shower screen fixed panel', quantity: 1, unitType: 'ea', price: 400 },
      { id: 'r15', description: 'Removal of the shower arm and wallplate', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'r16', description: 'Removal of the shower floor', quantity: 1, unitType: 'ea', price: 1450 },
      { id: 'r17', description: 'Removal of the shower door and fix panel', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'r18', description: 'Removal of the Frameless shower enclosure', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'r19', description: 'Removal of the shower enclosure', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'r20', description: 'Removal of the shower mixer, shower outlet and shower hand set', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'r21', description: 'Removal of the concrete and tiled shower seat', quantity: 1, unitType: 'ea', price: 1000 },
      { id: 'r22', description: 'Removal of the bathroom door', quantity: 1, unitType: 'ea', price: 150 },
      { id: 'r23', description: 'Removal of the cornices', quantity: 1, unitType: 'm', price: 120 },
      { id: 'r24', description: 'Removal of the walls tiles', quantity: 1, unitType: 'sqm', price: 150 },
      { id: 'r25', description: 'Removal of the floor tiles', quantity: 1, unitType: 'sqm', price: 200 },
      { id: 'r26', description: 'Removal of the floor mosaic tiles', quantity: 1, unitType: 'sqm', price: 200 },
      { id: 'r27', description: 'Removal of the floor screed', quantity: 1, unitType: 'sqm', price: 250 },
    ]
  },
  {
    id: 'plumb-water-2',
    name: '2. WATER SUPPLY PIPES',
    category: 'Water Supply',
    type: DocType.INVOICE,
    items: [
      // 2.1 GEYSER
      { id: 'g1', description: 'Labour (Removal of previous/Installation of new)', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'g2', description: 'Geyser Kwikot 600 kPA 150 Litres Dual superline 5 years warranty (Safety valve/drain cock included)', quantity: 1, unitType: 'ea', price: 3400 },
      { id: 'g3', description: 'Geyser Kwikot 400 kPA 150 Litres Dual superline', quantity: 1, unitType: 'ea', price: 3400 },
      { id: 'g4', description: 'Geyser Kwikot 400 kPA 100 Litres Dual superline', quantity: 1, unitType: 'ea', price: 3400 },
      { id: 'g5', description: 'Custom galvanised Drip Tray 150 Litres vertical 600mmx680mm', quantity: 1, unitType: 'ea', price: 580 },
      { id: 'g6', description: 'Drip Tray plastic 150/200 Litres horizontal', quantity: 1, unitType: 'ea', price: 260 },
      { id: 'g7', description: 'Wood board and brackets to sustained the drip tray', quantity: 1, unitType: 'ea', price: 250 },
      { id: 'g8', description: 'Rawl-bolts', quantity: 1, unitType: 'ea', price: 25 },
      { id: 'g9', description: 'Kwikot 600 kPa pressure control cartridge', quantity: 1, unitType: 'ea', price: 700 },
      { id: 'g10', description: 'Kwikot 400 kPa pressure control cartridge', quantity: 1, unitType: 'ea', price: 700 },
      { id: 'g11', description: 'Kwikot 600 kPa expansion relief valve cartridge', quantity: 1, unitType: 'ea', price: 175 },
      { id: 'g12', description: 'Kwikot 400 kPa expansion relief valve cartridge', quantity: 1, unitType: 'ea', price: 215 },
      { id: 'g13', description: 'Multi Pressure control and relief Valve 400 kPA CxC 22mm', quantity: 1, unitType: 'ea', price: 950 },
      { id: 'g14', description: 'Vacuum breaker kwikot diam 22mm', quantity: 1, unitType: 'ea', price: 175 },
      { id: 'g15', description: 'Package : Copper (pipes 22mm Class 1/0, fittings, soldering)', quantity: 1, unitType: 'ea', price: 1500 },
      { id: 'g16', description: 'Lagging the copper pipes around the geyser (4ml)', quantity: 1, unitType: 'ea', price: 120 },
      { id: 'g17', description: 'Package : 40mm PVC pipe, fittings and glue for drip tray connection', quantity: 1, unitType: 'ea', price: 450 },
      { id: 'g18', description: 'Installation of a 22mm non-return valve on the hot water supply pipe', quantity: 1, unitType: 'ea', price: 750 },
      // 2.2 BASIN
      { id: 'b1', description: 'Cold and Hot Water for the Basin : 2Pts (Pex-alumi 15mm into wall, patching chases)', quantity: 1, unitType: 'ea', price: 1850 },
      // 2.3 DOUBLE BASIN
      { id: 'db1', description: 'Cold and Hot Water for the double Basin : 4Pts (Pex-alumi 15mm into wall, patching chases)', quantity: 1, unitType: 'ea', price: 1250 },
      // 2.4 BATH EXPOSED MIXER
      { id: 'bem1', description: 'Cold and Hot Water for the Bath Mixer : 2Pts (Pex-alumi 22mm into wall, connection/installation)', quantity: 1, unitType: 'ea', price: 1850 },
      // 2.5 BATH CONCEALED MIXER
      { id: 'bcm1', description: 'Cold and Hot Water for the Bath Mixer : 2Pts (Mixed water for sprout, piping 22mm/15mm)', quantity: 1, unitType: 'ea', price: 1850 },
      // 2.6 SHOWER (WALK-IN)
      { id: 'sw1', description: 'Cold and Hot Water for the Shower Mixer : 2Pts (Pex-alumi 15mm)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'sw2', description: 'Undertile stop taps and shower head points', quantity: 1, unitType: 'ea', price: 1850 },
      // 2.7 TOILET / BIDET WATER POINTS
      { id: 'tb1', description: 'Cold water for Concealed toilet system (1pt)', quantity: 1, unitType: 'ea', price: 3850 },
      { id: 'tb2', description: 'Cold water for Concealed toilet system (Alternative 1pt)', quantity: 1, unitType: 'ea', price: 2450 },
      { id: 'tb3', description: 'Cold water for the cistern (Close-coupled 1pt)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'tb4', description: 'Hot and Cold water for the bidet mixer (2Pts)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'tb5', description: 'Cold water for WC bidet sprayer (1Pt)', quantity: 1, unitType: 'ea', price: 1850 },
      // 2.8 KITCHEN / LAUNDRY POINTS
      { id: 'kl1', description: 'Hot and Cold water for the sink mixer (2Pts)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'kl2', description: 'Cold water for the washing machine tap (1Pts)', quantity: 1, unitType: 'ea', price: 1850 },
    ]
  },
  {
    id: 'plumb-drain-3',
    name: '3. DRAIN PIPES',
    category: 'Drain Pipes',
    type: DocType.INVOICE,
    items: [
      { id: 'dp1', description: 'Double Basin: PVC Pipe underground diam 40mm & Installation', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'dp2', description: 'Basin: PVC Pipe underground diam 40mm & Installation', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'dp3', description: 'Bath: PVC Pipe underground diam 40mm & Installation', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'dp4', description: 'Walk-in Shower: PVC Pipe underground diam 40mm & Installation', quantity: 1, unitType: 'ea', price: 800 },
      { id: 'dp5', description: 'Shower Trap: Installation of the Shower Trap', quantity: 1, unitType: 'ea', price: 850 },
      { id: 'dp6', description: 'Wall-Hung Toilet: PVC Pipe underground 110mm', quantity: 1, unitType: 'ea', price: 1000 },
      { id: 'dp7', description: 'Close-Coupled Toilet: PVC Pipe underground 110mm (pan connector)', quantity: 1, unitType: 'ea', price: 1200 },
      { id: 'dp8', description: 'Wall-Hung Bidet: PVC Pipe underground diam 40mm', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'dp9', description: 'Sink: PVC Pipe underground diam 40mm (into wall/exposed)', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'dp10', description: 'Washing Machine: PVC Pipe underground diam 40mm (into wall/exposed)', quantity: 1, unitType: 'ea', price: 600 },
    ]
  },
  {
    id: 'plumb-inst-4',
    name: '4. INSTALLATIONS',
    category: 'Installations',
    type: DocType.INVOICE,
    items: [
      // 4.1 BASINS
      { id: 'ins1', description: 'Installation of the basin vanity (with silicone/mixer/waste/trap/valves)', quantity: 1, unitType: 'ea', price: 2400 },
      { id: 'ins2', description: 'Basin Installation (Fixation onto wall, mixer, waste, trap)', quantity: 1, unitType: 'ea', price: 2000 },
      { id: 'ins3', description: 'Double Basin and Vanity Installation', quantity: 1, unitType: 'ea', price: 3200 },
      // 4.2 BATHS
      { id: 'ins4', description: 'Built-in Bath Installation (75/32mm beam, sprout, overflow, light concrete mix)', quantity: 1, unitType: 'ea', price: 2500 },
      { id: 'ins5', description: 'Creation of a wall under the front of the bathtub', quantity: 1, unitType: 'ea', price: 2500 },
      { id: 'ins6', description: 'Bath Screen installation', quantity: 1, unitType: 'ea', price: 400 },
      { id: 'ins7', description: 'Free-standing Bath Installation', quantity: 1, unitType: 'ea', price: 3000 },
      // 4.3 SHOWERS
      { id: 'ins8', description: 'Walk-in Shower Creation (Concrete mix, 1:30 gradient, brick layer border)', quantity: 1, unitType: 'ea', price: 2300 },
      { id: 'ins9', description: 'Waterproofing Membrane (Cemflex and Sika)', quantity: 1, unitType: 'ea', price: 360 },
      { id: 'ins10', description: 'Installation of the Shower Screen', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'ins11', description: 'Installation of a Shower Enclosure', quantity: 1, unitType: 'ea', price: 1200 },
      { id: 'ins12', description: 'Monitoring installation of Frameless shower enclosure', quantity: 1, unitType: 'ea', price: 450 },
      { id: 'ins13', description: 'Installation of Shower Mixer after tiling', quantity: 1, unitType: 'ea', price: 400 },
      { id: 'ins14', description: 'Installation of Shower Arm and head', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'ins15', description: 'Installation of Hand Shower outlet', quantity: 1, unitType: 'ea', price: 400 },
      // 4.4 TOILETS & BIDETS
      { id: 'ins16', description: 'Wall-Hung WC into the wall Installation (Pan/Seat/Flush Plate)', quantity: 1, unitType: 'ea', price: 1650 },
      { id: 'ins17', description: 'Creation of brick wall around concealed toilet system and plastering', quantity: 1, unitType: 'ea', price: 3500 },
      { id: 'ins18', description: 'WC Bidet Spayer Installation (Angle valve/holder)', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'ins19', description: 'Close-Coupled Toilet Installation (Cistern/Pan/Seat/Tap)', quantity: 1, unitType: 'ea', price: 1650 },
      { id: 'ins20', description: 'Wall-Hung Bidet Installation (Fixations/Trap/Mixer/Waste/Valves)', quantity: 1, unitType: 'ea', price: 3500 },
      // 4.5 KITCHEN / OTHERS
      { id: 'ins21', description: 'Sink Installation (Sealant/Mixer/Waste/Trap/Valves)', quantity: 1, unitType: 'ea', price: 1750 },
      { id: 'ins22', description: 'Washing Machine plumbing Installation (Angle valve/washer)', quantity: 1, unitType: 'ea', price: 750 },
      { id: 'ins23', description: 'Towel Heater Installation (connecting to electrical box)', quantity: 1, unitType: 'ea', price: 650 },
    ]
  },
  {
    id: 'plumb-mas-5',
    name: '5. MASONRY & BUILDING',
    category: 'Masonry',
    type: DocType.INVOICE,
    items: [
      { id: 'mas1', description: 'Levelled concrete screed floor (after bathtub removal)', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'mas2', description: 'Concrete screed (after floor tile removal)', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'mas3', description: 'Self-levelling screed (Thin layer 3mm/m²)', quantity: 1, unitType: 'ea', price: 200 },
      { id: 'mas4', description: 'Self-levelling screed (Thin layer 6mm/m²)', quantity: 1, unitType: 'ea', price: 340 },
      { id: 'mas5', description: 'Self-levelling screed (Thin layer 9mm/m²)', quantity: 1, unitType: 'ea', price: 440 },
      { id: 'mas6', description: 'Wall shampoo Recess in shower (Removal of brick/Level/Plaster)', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'mas7', description: 'Nib Wall (Erect single brick layer)', quantity: 1, unitType: 'ea', price: 2500 },
      { id: 'mas8', description: 'Single Wall (Erect single brick layer)', quantity: 1, unitType: 'ea', price: 2250 },
      { id: 'mas9', description: 'Double Wall (Seat in shower)', quantity: 1, unitType: 'ea', price: 3500 },
      { id: 'mas10', description: 'Shower seat (Double brick layer)', quantity: 1, unitType: 'ea', price: 4000 },
      { id: 'mas11', description: 'Boxing for toilet drain pipes (Concrete mix and bricks)', quantity: 1, unitType: 'ea', price: 1500 },
      { id: 'mas12', description: 'Boxing for pipes (Nutec fiber cement board)', quantity: 1, unitType: 'ea', price: 1800 },
    ]
  },
  {
    id: 'plumb-tile-6',
    name: '6. TILING',
    category: 'Tiling',
    type: DocType.INVOICE,
    items: [
      { id: 'til1', description: 'Mosaic Tiling', quantity: 1, unitType: 'sqm', price: 1250 },
      { id: 'til2', description: 'Wall Tiling (Shower area up to 2.0mL H)', quantity: 1, unitType: 'sqm', price: 320 },
      { id: 'til3', description: 'Tile edge trim installation', quantity: 1, unitType: 'ea', price: 70 },
      { id: 'til4', description: 'Floor Tiling (300x300mm or bigger)', quantity: 1, unitType: 'sqm', price: 320 },
      { id: 'til5', description: 'Skirting tiles Cutting and Installation', quantity: 1, unitType: 'm', price: 80 },
      { id: 'til6', description: 'Skirting tiles (Blue masking tape/Painters mate)', quantity: 1, unitType: 'ea', price: 50 },
    ]
  },
  {
    id: 'plumb-ceil-7',
    name: '7. CEILING & PARTITIONING',
    category: 'Ceiling',
    type: DocType.INVOICE,
    items: [
      { id: 'ceil1', description: 'Partition wall installation (Frame/Struds/Plasterboards)', quantity: 1, unitType: 'ea', price: 1400 },
      { id: 'ceil2', description: 'False ceiling installation (Frame/Struds/Plasterboards)', quantity: 1, unitType: 'ea', price: 900 },
      { id: 'ceil3', description: 'False ceiling installation Shadow line', quantity: 1, unitType: 'ea', price: 1000 },
      { id: 'ceil4', description: 'Jointing, Skimming (Rhinoglide/Tape/Skim coat)', quantity: 1, unitType: 'ea', price: 200 },
      { id: 'ceil5', description: 'Installation of new cornice for ceiling/wall', quantity: 1, unitType: 'ea', price: 120 },
    ]
  },
  {
    id: 'plumb-elec-8',
    name: '8. ELECTRICAL',
    category: 'Electrical',
    type: DocType.INVOICE,
    items: [
      { id: 'elec1', description: 'Bathroom Extractor Fan installation', quantity: 1, unitType: 'ea', price: 1050 },
      { id: 'elec2', description: 'Bathroom Extractor fan, false ceiling installation', quantity: 1, unitType: 'ea', price: 600 },
      { id: 'elec3', description: 'Mirror light junction box installation', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'elec4', description: 'Towel heater junction box installation', quantity: 1, unitType: 'ea', price: 2250 },
      { id: 'elec5', description: 'Downlight installation', quantity: 1, unitType: 'ea', price: 350 },
      { id: 'elec6', description: 'Downlight Unit (DL033/3 WHITE LED)', quantity: 1, unitType: 'ea', price: 250 },
      { id: 'elec7', description: 'Installation of a switch for the bathroom light', quantity: 1, unitType: 'ea', price: 1850 },
      { id: 'elec8', description: 'Installation of a dimmer and a switch for downlights', quantity: 1, unitType: 'ea', price: 650 },
      { id: 'elec9', description: 'Installation of a 4x2 Plug', quantity: 1, unitType: 'ea', price: 1750 },
      { id: 'elec10', description: 'Installation of a 4x4 Plug', quantity: 1, unitType: 'ea', price: 2050 },
    ]
  },
  {
    id: 'plumb-paint-9',
    name: '9. PAINTING',
    category: 'Painting',
    type: DocType.INVOICE,
    items: [
      { id: 'pnt1', description: 'Paint Roller Set', quantity: 1, unitType: 'ea', price: 85 },
      { id: 'pnt2', description: 'Plascon White paint for bathroom and kitchen 2.5L/12.5m²', quantity: 1, unitType: 'ea', price: 550 },
      { id: 'pnt3', description: 'Apply 1 coat of primer paint, Ceiling and Walls', quantity: 1, unitType: 'sqm', price: 80 },
      { id: 'pnt4', description: 'Apply 2 coats of white paint finish, Ceiling and walls', quantity: 1, unitType: 'sqm', price: 140 },
      { id: 'pnt5', description: 'Apply 2 coats of colored paint finish, walls', quantity: 1, unitType: 'sqm', price: 180 },
      { id: 'pnt6', description: 'Painters mate applied between tiles and wall', quantity: 1, unitType: 'ea', price: 80 },
      { id: 'pnt7', description: 'Apply 2 coats of white paint finish, Door and/or Window', quantity: 1, unitType: 'ea', price: 350 },
    ]
  },
  {
    id: 'plumb-carp-10',
    name: '10. CARPENTRY',
    category: 'Carpentry',
    type: DocType.INVOICE,
    items: [
      { id: 'carp1', description: 'Door Installation (Hinges/Handle)', quantity: 1, unitType: 'ea', price: 2500 },
      { id: 'carp2', description: 'Door material: Hard Board Hollow Core', quantity: 1, unitType: 'ea', price: 400 },
      { id: 'carp3', description: 'Decorwood zinc plated bar hinge set', quantity: 1, unitType: 'ea', price: 630 },
      { id: 'carp4', description: 'Architrave standard 70mmW x2400mmL', quantity: 1, unitType: 'ea', price: 90 },
      { id: 'carp5', description: 'Ceiling Trap Door Installation', quantity: 1, unitType: 'ea', price: 500 },
      { id: 'carp6', description: 'Ceiling trap door materials (610mmx610mm White)', quantity: 1, unitType: 'ea', price: 750 },
      { id: 'carp7', description: 'Wood Floating shelf for basin (900mmL x 500mmW)', quantity: 1, unitType: 'ea', price: 5000 },
      { id: 'carp8', description: 'Shelf installation', quantity: 1, unitType: 'ea', price: 2000 },
    ]
  }
];
