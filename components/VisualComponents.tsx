/**
 * Visual Components for Contracts
 * Industry-specific charts, diagrams, and visual elements
 */

import React, { useState } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';

export type VisualComponentType = 
  | 'pie-chart'
  | 'bar-chart'
  | 'timeline'
  | 'cost-breakdown'
  | 'tech-stack'
  | 'site-architecture'
  | 'project-phases'
  | 'pipe-diagram'
  | 'feature-matrix';

export interface VisualComponentData {
  id: string;
  type: VisualComponentType;
  title: string;
  data: any;
}

interface PieChartSection {
  label: string;
  percentage: number;
  color: string;
}

interface PieChartProps {
  data: PieChartSection[];
  title: string;
  editable: boolean;
  onUpdate?: (data: PieChartSection[]) => void;
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export const PieChart: React.FC<PieChartProps> = ({ data, title, editable, onUpdate }) => {
  const [sections, setSections] = useState<PieChartSection[]>(data);
  const [editMode, setEditMode] = useState(false);

  const total = sections.reduce((sum, s) => sum + s.percentage, 0);
  let currentAngle = -90; // Start from top

  const addSection = () => {
    const newSection: PieChartSection = {
      label: 'New Section',
      percentage: 10,
      color: COLORS[sections.length % COLORS.length],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    onUpdate?.(updated);
  };

  const updateSection = (index: number, field: keyof PieChartSection, value: any) => {
    const updated = sections.map((s, i) => i === index ? { ...s, [field]: value } : s);
    setSections(updated);
    onUpdate?.(updated);
  };

  const deleteSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
    onUpdate?.(updated);
  };

  const createSlicePath = (percentage: number, startAngle: number): string => {
    // Use actual percentage value directly, normalized to total if needed
    const normalizedPercentage = total > 0 ? (percentage / total) * 100 : 0;
    const angle = (normalizedPercentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="my-8 p-6 border border-gray-300 bg-gray-50 rounded print:break-inside-avoid">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="p-2 hover:bg-gray-200 rounded print:hidden"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={addSection}
              className="p-2 hover:bg-gray-200 rounded print:hidden"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {(() => {
              let angle = -90; // Start from top
              return sections.map((section, index) => {
                const slice = createSlicePath(section.percentage, angle);
                // Calculate next angle using normalized percentage
                const normalizedPercentage = total > 0 ? (section.percentage / total) * 100 : 0;
                angle += (normalizedPercentage / 100) * 360;
                return (
                  <path
                    key={index}
                    d={slice}
                    fill={section.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              });
            })()}
          </svg>
        </div>

        {/* Legend and Edit Controls */}
        <div className="flex-1">
          {editMode && editable ? (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={section.color}
                    onChange={(e) => updateSection(index, 'color', e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                  <input
                    type="text"
                    value={section.label}
                    onChange={(e) => updateSection(index, 'label', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Label"
                  />
                  <input
                    type="number"
                    value={section.percentage}
                    onChange={(e) => updateSection(index, 'percentage', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-600">%</span>
                  <button
                    onClick={() => deleteSection(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {total !== 100 && (
                <p className="text-sm text-red-600">Total: {total.toFixed(1)}% (should be 100%)</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: section.color }}
                  />
                  <span className="text-sm">{section.label}</span>
                  <span className="text-sm font-bold text-gray-600">{section.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Component for project phases
interface TimelineItem {
  phase: string;
  duration: string;
  description: string;
}

interface TimelineProps {
  title: string;
  items: TimelineItem[];
  editable: boolean;
  onUpdate?: (items: TimelineItem[]) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ title, items, editable, onUpdate }) => {
  const [phases, setPhases] = useState(items);

  const addPhase = () => {
    const updated = [...phases, { phase: 'New Phase', duration: '1 week', description: '' }];
    setPhases(updated);
    onUpdate?.(updated);
  };

  const updatePhase = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = phases.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setPhases(updated);
    onUpdate?.(updated);
  };

  const deletePhase = (index: number) => {
    const updated = phases.filter((_, i) => i !== index);
    setPhases(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="my-8 p-6 border border-gray-300 bg-gray-50 rounded print:break-inside-avoid">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <button onClick={addPhase} className="p-2 hover:bg-gray-200 rounded print:hidden">
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-600" />
        
        {phases.map((item, index) => (
          <div key={index} className="relative pl-12 pb-8 last:pb-0">
            <div className="absolute left-2 top-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow" />
            
            {editable ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.phase}
                    onChange={(e) => updatePhase(index, 'phase', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded font-bold"
                    placeholder="Phase name"
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updatePhase(index, 'duration', e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Duration"
                  />
                  <button
                    onClick={() => deletePhase(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600 print:hidden"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => updatePhase(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Description"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{item.phase}</h4>
                  <span className="text-sm text-gray-600">({item.duration})</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-700">{item.description}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Tech Stack Visualization
interface TechItem {
  name: string;
  category: string;
}

interface TechStackProps {
  title: string;
  stack: TechItem[];
  editable: boolean;
  onUpdate?: (stack: TechItem[]) => void;
}

export const TechStack: React.FC<TechStackProps> = ({ title, stack, editable, onUpdate }) => {
  const [items, setItems] = useState(stack);

  const categories = Array.from(new Set(items.map(item => item.category)));

  const addTech = () => {
    const updated = [...items, { name: 'New Technology', category: 'Frontend' }];
    setItems(updated);
    onUpdate?.(updated);
  };

  const updateTech = (index: number, field: keyof TechItem, value: string) => {
    const updated = items.map((t, i) => i === index ? { ...t, [field]: value } : t);
    setItems(updated);
    onUpdate?.(updated);
  };

  const deleteTech = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="my-8 p-6 border border-gray-300 bg-gray-50 rounded print:break-inside-avoid">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <button onClick={addTech} className="p-2 hover:bg-gray-200 rounded print:hidden">
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <div key={category}>
            <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase tracking-wide">{category}</h4>
            <div className="space-y-2">
              {items
                .filter(item => item.category === category)
                .map((item, index) => {
                  const globalIndex = items.indexOf(item);
                  return editable ? (
                    <div key={globalIndex} className="flex gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateTech(globalIndex, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => deleteTech(globalIndex)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 print:hidden"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div key={globalIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {item.name}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Cost Breakdown Table
interface CostItem {
  item: string;
  quantity: number;
  rate: number;
  total: number;
}

interface CostBreakdownProps {
  title: string;
  items: CostItem[];
  currency: string;
  editable: boolean;
  onUpdate?: (items: CostItem[]) => void;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ title, items, currency, editable, onUpdate }) => {
  const [costs, setCosts] = useState(items);

  const addCost = () => {
    const updated = [...costs, { item: 'New Item', quantity: 1, rate: 0, total: 0 }];
    setCosts(updated);
    onUpdate?.(updated);
  };

  const updateCost = (index: number, field: keyof CostItem, value: any) => {
    const updated = costs.map((c, i) => {
      if (i !== index) return c;
      const newCost = { ...c, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        newCost.total = newCost.quantity * newCost.rate;
      }
      return newCost;
    });
    setCosts(updated);
    onUpdate?.(updated);
  };

  const deleteCost = (index: number) => {
    const updated = costs.filter((_, i) => i !== index);
    setCosts(updated);
    onUpdate?.(updated);
  };

  const grandTotal = costs.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="my-8 p-6 border border-gray-300 bg-gray-50 rounded print:break-inside-avoid">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <button onClick={addCost} className="p-2 hover:bg-gray-200 rounded print:hidden">
            <Plus size={16} />
          </button>
        )}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
            {editable && <th className="border border-gray-300 px-3 py-2 print:hidden"></th>}
          </tr>
        </thead>
        <tbody>
          {costs.map((cost, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-3 py-2">
                {editable ? (
                  <input
                    type="text"
                    value={cost.item}
                    onChange={(e) => updateCost(index, 'item', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  cost.item
                )}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {editable ? (
                  <input
                    type="number"
                    value={cost.quantity}
                    onChange={(e) => updateCost(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                  />
                ) : (
                  cost.quantity
                )}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {editable ? (
                  <input
                    type="number"
                    value={cost.rate}
                    onChange={(e) => updateCost(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                  />
                ) : (
                  `${currency}${cost.rate.toFixed(2)}`
                )}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                {currency}{cost.total.toFixed(2)}
              </td>
              {editable && (
                <td className="border border-gray-300 px-3 py-2 text-center print:hidden">
                  <button
                    onClick={() => deleteCost(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right">TOTAL:</td>
            <td className="border border-gray-300 px-3 py-2 text-right">{currency}{grandTotal.toFixed(2)}</td>
            {editable && <td className="print:hidden"></td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Bar Chart Component - Comparison visualization
interface BarChartItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  title: string;
  items: BarChartItem[];
  unit: string;
  editable: boolean;
  onUpdate?: (items: BarChartItem[]) => void;
}

export const BarChart: React.FC<BarChartProps> = ({ title, items, unit, editable, onUpdate }) => {
  const [bars, setBars] = useState(items);

  const maxValue = Math.max(...bars.map(b => b.value), 1);

  const addBar = () => {
    const updated = [...bars, { label: 'New Item', value: 50, color: COLORS[bars.length % COLORS.length] }];
    setBars(updated);
    onUpdate?.(updated);
  };

  const updateBar = (index: number, field: keyof BarChartItem, value: any) => {
    const updated = bars.map((b, i) => i === index ? { ...b, [field]: value } : b);
    setBars(updated);
    onUpdate?.(updated);
  };

  const deleteBar = (index: number) => {
    const updated = bars.filter((_, i) => i !== index);
    setBars(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="my-8 p-6 border border-gray-300 bg-gray-50 rounded print:break-inside-avoid">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <button onClick={addBar} className="p-2 hover:bg-gray-200 rounded print:hidden">
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {bars.map((bar, index) => (
          <div key={index}>
            {editable ? (
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="color"
                  value={bar.color}
                  onChange={(e) => updateBar(index, 'color', e.target.value)}
                  className="w-8 h-8 rounded"
                />
                <input
                  type="text"
                  value={bar.label}
                  onChange={(e) => updateBar(index, 'label', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  placeholder="Label"
                />
                <input
                  type="number"
                  value={bar.value}
                  onChange={(e) => updateBar(index, 'value', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">{unit}</span>
                <button
                  onClick={() => deleteBar(index)}
                  className="p-1 hover:bg-red-100 rounded text-red-600 print:hidden"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium w-32">{bar.label}</span>
                <span className="text-sm text-gray-600">{bar.value} {unit}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded h-8">
                <div
                  className="h-full rounded flex items-center justify-end pr-2 text-white text-sm font-bold"
                  style={{
                    width: `${(bar.value / maxValue) * 100}%`,
                    backgroundColor: bar.color,
                    minWidth: bar.value > 0 ? '40px' : '0',
                  }}
                >
                  {bar.value > 0 && `${bar.value}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
