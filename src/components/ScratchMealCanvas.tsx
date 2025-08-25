import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ScratchFoodBlock } from './ScratchFoodBlock';
import { Food } from '../types/food';

interface PlacedBlock {
  id: string;
  food: Food;
  x: number;
  y: number;
  portionSize: number;
  connectedTo: string[];
}

interface ScratchMealCanvasProps {
  blocks: PlacedBlock[];
  onBlockDrop: (food: Food, x: number, y: number) => void;
  onBlockRemove: (blockId: string) => void;
  onPortionChange: (blockId: string, newSize: number) => void;
  onClear: () => void;
  onBlockClick?: (food: Food) => void;
  selectedFood?: Food | null;
  gridCols: number;
  gridRows: number;
  cellWidth: number;
  cellHeight: number;
}

export function ScratchMealCanvas({
  blocks,
  onBlockDrop,
  onBlockRemove,
  onPortionChange,
  onClear,
  onBlockClick,
  selectedFood,
  gridCols,
  gridRows,
  cellWidth,
  cellHeight
}: ScratchMealCanvasProps) {
  // Calculate canvas size based on grid
  const canvasWidth = gridCols * cellWidth;
  const canvasHeight = gridRows * cellHeight;
  
  const { isOver, setNodeRef } = useDroppable({
    id: 'scratch-canvas',
  });

  // Calculate total nutrition
  const totalNutrition = blocks.reduce((total, block) => {
    const mult = block.portionSize;
    return {
      calories: total.calories + ((block.food.nutrients.calories?.amount ?? 0) * mult),
      iron: total.iron + ((block.food.nutrients.iron?.amount ?? 0) * mult),
      protein: total.protein + ((block.food.nutrients.protein?.amount ?? 0) * mult),
      calcium: total.calcium + ((block.food.nutrients.calcium?.amount ?? 0) * mult),
    };
  }, { calories: 0, iron: 0, protein: 0, calcium: 0 });

  // Simple nutrition targets for a meal (not competitive, just informative)
  const targets = {
    calories: 150,
    iron: 3,
    protein: 4,
    calcium: 80
  };

  const getProgress = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🍽️ Sophie's Meal Builder
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag food blocks together like Scratch programming!
            </p>
          </div>
          {blocks.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">Blocks: </span>
                <span className="font-bold text-purple-600">{blocks.length}</span>
              </div>
              <button
                onClick={onClear}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {/* Main Canvas Area */}
        <div className="col-span-2">
          <div
            ref={setNodeRef}
            data-droppable-id="scratch-canvas"
            className={`
              relative bg-gradient-to-br from-gray-50 to-gray-100 
              transition-all duration-300
              ${isOver ? 'bg-blue-50 ring-4 ring-blue-400 ring-inset' : ''}
            `}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent 0px, transparent ${cellWidth - 1}px, rgba(0,0,0,0.1) ${cellWidth - 1}px, rgba(0,0,0,0.1) ${cellWidth}px),
                repeating-linear-gradient(0deg, transparent 0px, transparent ${cellHeight - 1}px, rgba(0,0,0,0.1) ${cellHeight - 1}px, rgba(0,0,0,0.1) ${cellHeight}px)
              `
            }}
          >
            {/* Placed blocks */}
            {blocks.map(block => (
              <div
                key={block.id}
                className="absolute"
                style={{
                  left: block.x,
                  top: block.y,
                  zIndex: 10
                }}
              >
                <ScratchFoodBlock
                  food={block.food}
                  size={cellWidth}
                  isPlaced={true}
                  portionSize={block.portionSize}
                  onPortionChange={(size) => onPortionChange(block.id, size)}
                  onClick={() => {
                    console.log('Canvas block clicked:', block.food.name); // Debug log
                    if (onBlockClick) {
                      onBlockClick(block.food);
                    }
                  }}
                  isSelected={selectedFood?.fdcId === block.food.fdcId}
                />
                
                {/* Remove button */}
                <button
                  onClick={() => onBlockRemove(block.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 shadow-md z-20"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Diagram-style connections - clean lines between nearby blocks */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <defs>
                <marker 
                  id="dot" 
                  markerWidth="4" 
                  markerHeight="4" 
                  refX="2" 
                  refY="2"
                >
                  <circle cx="2" cy="2" r="2" fill="#6366F1" />
                </marker>
              </defs>
              
              {blocks.map(block => {
                // Find blocks within connection range (2 cells in any direction)
                const nearbyBlocks = blocks.filter(otherBlock => {
                  if (otherBlock.id === block.id) return false;
                  
                  const dx = Math.abs(block.x - otherBlock.x);
                  const dy = Math.abs(block.y - otherBlock.y);
                  
                  // Connect blocks within 2 cells distance
                  return (dx <= cellWidth * 2 && dy <= cellHeight * 2) && (dx + dy > 0);
                });
                
                return nearbyBlocks.map(nearby => (
                  <g key={`connection-${block.id}-${nearby.id}`}>
                    {/* Clean connection line */}
                    <line
                      x1={block.x + cellWidth / 2}
                      y1={block.y + cellHeight / 2}
                      x2={nearby.x + cellWidth / 2}
                      y2={nearby.y + cellHeight / 2}
                      stroke="#6366F1"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                      opacity="0.6"
                      markerStart="url(#dot)"
                      markerEnd="url(#dot)"
                    />
                  </g>
                ));
              })}
            </svg>

            {/* Empty state */}
            {blocks.length === 0 && !isOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-8xl mb-6">🧩</div>
                <h3 className="text-2xl font-bold mb-2">Build Sophie's Meal</h3>
                <p className="text-lg mb-4 text-center max-w-md">
                  Drag food blocks here and connect them like Scratch programming!
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Any block can connect to any other</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>No rules, just creativity!</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drag feedback */}
            {isOver && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse">
                  Drop Here!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Nutrition Panel */}
        <div className="col-span-1 bg-gray-50 p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📊 Meal Overview
          </h3>

          {blocks.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-sm">Add blocks to see nutrition</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple nutrition display */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Nutrition Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-bold text-orange-600">{Math.round(totalNutrition.calories)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Iron</span>
                    <span className="font-bold text-red-600">{totalNutrition.iron.toFixed(1)}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-bold text-purple-600">{totalNutrition.protein.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calcium</span>
                    <span className="font-bold text-blue-600">{Math.round(totalNutrition.calcium)}mg</span>
                  </div>
                </div>
              </div>

              {/* Simple progress indicators (informative, not competitive) */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Towards Daily Needs</h4>
                <div className="space-y-2">
                  {Object.entries(targets).map(([key, target]) => {
                    const value = totalNutrition[key as keyof typeof totalNutrition];
                    const progress = getProgress(value, target);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="capitalize">{key}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simple encouragement */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700">
                  {blocks.length >= 4 ? (
                    <>🌟 Great variety! Sophie will love this balanced meal.</>
                  ) : blocks.length >= 2 ? (
                    <>👍 Good start! Try adding more variety.</>
                  ) : (
                    <>🍽️ Keep building Sophie's meal!</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}