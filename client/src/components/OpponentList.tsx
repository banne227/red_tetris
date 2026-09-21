export interface OpponentSpectrum {
  id: string;
  name: string;
  spectrum: number[]; // hauteur par colonne, cf computeSpectrum côté shared
}

interface OpponentListProps {
  opponents: OpponentSpectrum[];
  boardHeight?: number; // pour normaliser la hauteur des barres (défaut 20)
}

// Composant purement présentationnel : affiche le nom + le spectre de
// chaque adversaire sous forme de mini histogramme.
export default function OpponentList({ opponents, boardHeight = 20 }: OpponentListProps) {
  if (opponents.length === 0) return null;

  return (
    <aside className="opponent-list">
      <h2 className="opponent-list-title">Adversaires</h2>
      {opponents.map((opponent) => (
        <div className="opponent-card" key={opponent.id}>
          <p className="opponent-name">{opponent.name}</p>
          <div className="opponent-spectrum">
            {opponent.spectrum.map((height, colIndex) => (
              <div
                key={colIndex}
                className="opponent-spectrum-col"
                style={{ height: `${Math.min(100, (height / boardHeight) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
