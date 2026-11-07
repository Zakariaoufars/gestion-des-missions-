import React, { useState } from 'react';
import { X, CheckCircle2, Fuel, AlertTriangle, Gauge, Car } from 'lucide-react';
import { Mission } from '../types/index.ts';

interface MissionCloseModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onMissionClosed: () => void;
}

export const MissionCloseModal: React.FC<MissionCloseModalProps> = ({
  mission,
  isOpen,
  onClose,
  onMissionClosed,
}) => {
  if (!isOpen || !mission) return null;

  const [kmFinal, setKmFinal] = useState<number>(mission.kmInitial + 180);
  const [quantiteConsommee, setQuantiteConsommee] = useState<number>(Number(mission.quantiteCarburantLitres) || 15);
  const [niveauCarburantFinal, setNiveauCarburantFinal] = useState<string>('1/2');
  const [anomalieConstatee, setAnomalieConstatee] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const kmInitial = mission.kmInitial;
  const distanceParcourue = Math.max(0, kmFinal - kmInitial);
  const quantiteAttribuee = Number(mission.quantiteCarburantLitres) || 0;
  const soldeRestant = Math.round((quantiteAttribuee - quantiteConsommee) * 10) / 10;
  const consoMoyenneReelle = distanceParcourue > 0 ? Math.round((quantiteConsommee / distanceParcourue) * 100 * 10) / 10 : 0;

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kmFinal < kmInitial) {
      setError('Le kilométrage final ne peut être inférieur au kilométrage initial.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/missions/${mission.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kmFinal,
          quantiteReellementConsommee: quantiteConsommee,
          niveauCarburantFinal,
          anomalieConstatee: anomalieConstatee.trim() || null,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la clôture');

      onMissionClosed();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur de clôture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-emerald-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              Clôture de Mission & Contrôle Carburant
            </h3>
            <p className="text-xs text-emerald-200">
              {mission.numeroMission} • {mission.vehicleImmat}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCloseSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
              {error}
            </div>
          )}

          {/* Mission summary snapshot */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block">Agent de mission</span>
              <span className="font-bold text-slate-900">{mission.employeeNom}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Destination</span>
              <span className="font-bold text-slate-900">{mission.destination}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Km Initial Compteur</span>
              <span className="font-bold text-slate-900">{kmInitial.toLocaleString('fr-FR')} km</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Dotation Carburant</span>
              <span className="font-bold text-emerald-800">{quantiteAttribuee} L ({mission.montantCarburantDh} DH)</span>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kilométrage Final au Retour *
              </label>
              <input
                type="number"
                value={kmFinal}
                onChange={(e) => setKmFinal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantité Réellement Consommée (L) *
              </label>
              <input
                type="number"
                step="0.1"
                value={quantiteConsommee}
                onChange={(e) => setQuantiteConsommee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Niveau Carburant Final Réservoir *
              </label>
              <select
                value={niveauCarburantFinal}
                onChange={(e) => setNiveauCarburantFinal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 text-xs"
              >
                <option value="1/8">1/8 (Réserve)</option>
                <option value="1/4">1/4 (Quart)</option>
                <option value="1/2">1/2 (Demi)</option>
                <option value="3/4">3/4 (Trois-quarts)</option>
                <option value="1/1">1/1 (Plein)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Solde Carburant Restant
              </label>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-emerald-800 text-xs flex items-center justify-between">
                <span>{soldeRestant} Litres</span>
                <span className="text-[10px] text-emerald-600">~{Math.round(soldeRestant * 13)} DH</span>
              </div>
            </div>
          </div>

          {/* Automatic calculation results banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                Calculs Automatiques
              </span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                Distance: <span className="font-black text-emerald-900">{distanceParcourue} km</span> • Consommation Moyenne: <span className="font-black text-emerald-900">{consoMoyenneReelle} L/100km</span>
              </p>
            </div>
            <Gauge className="w-6 h-6 text-emerald-700 shrink-0" />
          </div>

          {/* Anomalies */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Anomalie éventuelle constatée (laisser vide si conforme)
            </label>
            <input
              type="text"
              value={anomalieConstatee}
              onChange={(e) => setAnomalieConstatee(e.target.value)}
              placeholder="Ex: Écart de carburant constaté, déviation d'itinéraire non prévue..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Le véhicule sera remis à l'état "Disponible".
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Clôture en cours...' : 'Valider la Clôture'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
