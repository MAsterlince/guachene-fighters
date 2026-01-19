import React, { useState } from 'react';
import { GameMap } from '@/types/game';
import { MAPS } from '@/data/gameData';
import tituloImg from '@/assets/titulo.png';

interface MapSelectProps {
  onSelectMap: (map: GameMap) => void;
  onBack: () => void;
}

export function MapSelect({ onSelectMap, onBack }: MapSelectProps) {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);

  const handleMapClick = (map: GameMap) => {
    setSelectedMap(map);
  };

  const handleProceed = () => {
    if (selectedMap) {
      onSelectMap(selectedMap);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-4">
        {/* Header */}
        <img 
          src={tituloImg} 
          alt="Guachene Fighters" 
          className="w-[300px] mb-4 drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 165, 0, 0.4))' }}
        />
        
        <h2 className="text-2xl font-pixel text-foreground mb-2">
          ELIGE EL ESCENARIO
        </h2>
        
        <p className="text-fire-yellow text-sm font-pixel mb-8">
          Selecciona donde pelear
        </p>

        {/* Map grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {MAPS.map((map) => {
            const isSelected = selectedMap?.id === map.id;
            
            return (
              <button
                key={map.id}
                onClick={() => handleMapClick(map)}
                className={`map-card ${isSelected ? 'selected' : ''} group`}
              >
                {/* Map preview */}
                <div className="w-80 h-48 overflow-hidden">
                  <img 
                    src={map.image} 
                    alt={map.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                  <span className="text-lg font-pixel text-foreground uppercase text-shadow-dark">
                    {map.name}
                  </span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-fire-yellow rounded-lg pointer-events-none">
                    <div className="absolute top-2 right-2 bg-fire-yellow text-background px-2 py-1 text-xs font-pixel rounded">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected map preview */}
        {selectedMap && (
          <div className="mb-8 text-center">
            <p className="text-muted-foreground text-xs font-pixel mb-2">ESCENARIO SELECCIONADO</p>
            <p className="text-xl font-pixel fire-gradient">{selectedMap.name}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button onClick={onBack} className="arcade-button-secondary">
            Volver
          </button>
          
          {selectedMap && (
            <button onClick={handleProceed} className="arcade-button">
              ¡Comenzar!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
