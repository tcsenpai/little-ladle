import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { GamePuzzlePiece } from './GamePuzzlePiece';
import { Food } from '../types/food';

interface PlacedPiece {
  id: string;
  food: Food;
  gridX: number;
  gridY: number;
  portionSize: number;
  edges: {
    top: 'tab' | 'blank' | 'slot';
    right: 'tab' | 'blank' | 'slot';
    bottom: 'tab' | 'blank' | 'slot';
    left: 'tab' | 'blank' | 'slot';
  };
  connections: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

interface GamePuzzleCanvasProps {
  pieces: PlacedPiece[];
  onPieceDrop: (food: Food, x: number, y: number, edges: any) => void;
  onPieceRemove: (pieceId: string) => void;
  onPortionChange: (pieceId: string, newSize: number) => void;
  activeDraggedPiece?: { food: Food; edges: any } | null;
  selectedFood: Food | null;
}

const PIECE_SIZE = 80;
const GRID_COLS = 8;
const GRID_ROWS = 5;
const SNAP_THRESHOLD = 30;

export function GamePuzzleCanvas({
  pieces,
  onPieceDrop,
  onPieceRemove,
  onPortionChange,
  activeDraggedPiece,
  selectedFood
}: GamePuzzleCanvasProps) {
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [validSnapPoints, setValidSnapPoints] = useState<{ x: number; y: number; side: string }[]>([]);
  
  const { isOver, setNodeRef, active } = useDroppable({
    id: 'game-puzzle-canvas',
  });

  // Calculate snap points for magnetic connection
  useEffect(() => {
    if (!activeDraggedPiece) {
      setValidSnapPoints([]);
      return;
    }

    const snapPoints: { x: number; y: number; side: string }[] = [];
    
    pieces.forEach(piece => {
      // Check each side for valid connections
      if (canConnect(activeDraggedPiece.edges.right, piece.edges.left) && !piece.connections.left) {
        snapPoints.push({ x: piece.gridX - 1, y: piece.gridY, side: 'left' });
      }
      if (canConnect(activeDraggedPiece.edges.left, piece.edges.right) && !piece.connections.right) {
        snapPoints.push({ x: piece.gridX + 1, y: piece.gridY, side: 'right' });
      }
      if (canConnect(activeDraggedPiece.edges.bottom, piece.edges.top) && !piece.connections.top) {
        snapPoints.push({ x: piece.gridX, y: piece.gridY - 1, side: 'top' });
      }
      if (canConnect(activeDraggedPiece.edges.top, piece.edges.bottom) && !piece.connections.bottom) {
        snapPoints.push({ x: piece.gridX, y: piece.gridY + 1, side: 'bottom' });
      }
    });
    
    setValidSnapPoints(snapPoints);
  }, [activeDraggedPiece, pieces]);

  const canConnect = (edge1: string, edge2: string) => {
    return (edge1 === 'tab' && edge2 === 'slot') || (edge1 === 'slot' && edge2 === 'tab');
  };

  const isPositionOccupied = (x: number, y: number) => {
    return pieces.some(p => p.gridX === x && p.gridY === y);
  };

  // Calculate total nutrition
  const nutrition = pieces.reduce((total, piece) => {
    const mult = piece.portionSize;
    return {
      calories: total.calories + ((piece.food.nutrients.calories?.amount ?? 0) * mult),
      iron: total.iron + ((piece.food.nutrients.iron?.amount ?? 0) * mult),
      protein: total.protein + ((piece.food.nutrients.protein?.amount ?? 0) * mult),
      calcium: total.calcium + ((piece.food.nutrients.calcium?.amount ?? 0) * mult),
    };
  }, { calories: 0, iron: 0, protein: 0, calcium: 0 });

  // Count connections
  const connectionCount = pieces.reduce((count, piece) => {
    return count + Object.values(piece.connections).filter(Boolean).length;
  }, 0) / 2; // Divide by 2 because connections are bidirectional

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🎮 Puzzle Board
        </h2>
        <div className="flex gap-3">
          {pieces.length > 0 && (
            <>
              <div className="bg-white px-3 py-1 rounded-full shadow-md">
                <span className="text-sm text-gray-600">Pieces: </span>
                <span className="font-bold text-indigo-600">{pieces.length}</span>
              </div>
              <div className="bg-white px-3 py-1 rounded-full shadow-md">
                <span className="text-sm text-gray-600">Links: </span>
                <span className="font-bold text-green-600">{connectionCount}</span>
              </div>
              <button
                onClick={() => pieces.forEach(p => onPieceRemove(p.id))}
                className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors shadow-md"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={setNodeRef}
        className={`
          relative bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-inner
          transition-all duration-300 overflow-hidden
          ${isOver ? 'ring-4 ring-indigo-400 ring-opacity-50' : ''}
        `}
        style={{
          width: GRID_COLS * PIECE_SIZE,
          height: GRID_ROWS * PIECE_SIZE,
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(200,200,200,0.3) 0px, transparent 1px, transparent ${PIECE_SIZE - 1}px, rgba(200,200,200,0.3) ${PIECE_SIZE}px),
            repeating-linear-gradient(90deg, rgba(200,200,200,0.3) 0px, transparent 1px, transparent ${PIECE_SIZE - 1}px, rgba(200,200,200,0.3) ${PIECE_SIZE}px)
          `
        }}
      >
        {/* Snap point indicators */}
        {validSnapPoints.map((point, idx) => (
          <div
            key={idx}
            className="absolute animate-pulse"
            style={{
              left: point.x * PIECE_SIZE,
              top: point.y * PIECE_SIZE,
              width: PIECE_SIZE,
              height: PIECE_SIZE,
            }}
          >
            <div className="w-full h-full border-2 border-green-400 bg-green-100 bg-opacity-30 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-500 rounded-full animate-ping" />
            </div>
          </div>
        ))}

        {/* Placed pieces */}
        {pieces.map(piece => (
          <div
            key={piece.id}
            className="absolute transition-all duration-300"
            style={{
              left: piece.gridX * PIECE_SIZE,
              top: piece.gridY * PIECE_SIZE,
            }}
          >
            <GamePuzzlePiece
              food={piece.food}
              size={PIECE_SIZE}
              isPlaced={true}
              portionSize={piece.portionSize}
              edges={piece.edges}
            />
            
            {/* Remove button */}
            <button
              onClick={() => onPieceRemove(piece.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-md z-10"
            >
              ×
            </button>
            
            {/* Portion controls */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-full px-1 py-0.5 shadow-md">
              {[0.5, 1, 1.5, 2].map(size => (
                <button
                  key={size}
                  onClick={() => onPortionChange(piece.id, size)}
                  className={`
                    w-4 h-4 rounded-full text-xs transition-all
                    ${size === piece.portionSize 
                      ? 'bg-blue-500 text-white scale-110' 
                      : 'bg-gray-200 hover:bg-gray-300'
                    }
                  `}
                  style={{ fontSize: '9px' }}
                >
                  {size === 0.5 ? '½' : size}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {pieces.length === 0 && !isOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4 animate-bounce">🧩</div>
            <p className="text-lg font-medium">Drag pieces here!</p>
            <p className="text-sm mt-2">They'll snap together magnetically</p>
          </div>
        )}
      </div>

      {/* Mini nutrition bar */}
      {pieces.length > 0 && (
        <div className="mt-3 bg-white rounded-lg p-2 shadow-md">
          <div className="flex justify-around text-xs">
            <div>
              <span className="text-gray-600">Cal: </span>
              <span className="font-bold text-orange-600">{Math.round(nutrition.calories)}</span>
            </div>
            <div>
              <span className="text-gray-600">Fe: </span>
              <span className="font-bold text-red-600">{nutrition.iron.toFixed(1)}mg</span>
            </div>
            <div>
              <span className="text-gray-600">Pro: </span>
              <span className="font-bold text-purple-600">{nutrition.protein.toFixed(1)}g</span>
            </div>
            <div>
              <span className="text-gray-600">Ca: </span>
              <span className="font-bold text-blue-600">{Math.round(nutrition.calcium)}mg</span>
            </div>
          </div>
          {connectionCount > 0 && (
            <div className="text-center mt-1 text-xs text-green-600 font-bold">
              +{connectionCount * 10}% Connection Bonus!
            </div>
          )}
        </div>
      )}
    </div>
  );
}