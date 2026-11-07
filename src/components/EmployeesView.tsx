import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Building2,
  Phone,
  Mail,
  FileSpreadsheet,
} from 'lucide-react';
import { Employee } from '../types/index.ts';
import * as XLSX from 'xlsx';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('TOUS');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [grade, setGrade] = useState('Ingénieur');
  const [fonction, setFonction] = useState('');
  const [service, setService] = useState('SER');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setMatricule(`M-${Math.floor(1000 + Math.random() * 9000)}`);
    setNom('');
    setPrenom('');
    setGrade('Ingénieur');
    setFonction('Ingénieur Agronome');
    setService('SVOP');
    setTelephone('+212 6');
    setEmail('');
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setMatricule(emp.matricule);
    setNom(emp.nom);
    setPrenom(emp.prenom);
    setGrade(emp.grade);
    setFonction(emp.fonction);
    setService(emp.service);
    setTelephone(emp.telephone || '');
    setEmail(emp.email || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        matricule,
        nom,
        prenom,
        grade,
        fonction,
        service,
        telephone,
        email,
      };

      let res;
      if (editingEmployee) {
        res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur enregistrement');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmez-vous la suppression de cet employé ?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEmployees();
      } else {
        const d = await res.json();
        alert(d.error || 'Impossible de supprimer');
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportExcel = () => {
    const data = employees.map((e) => ({
      'Matricule': e.matricule,
      'Nom': e.nom,
      'Prénom': e.prenom,
      'Grade': e.grade,
      'Fonction': e.fonction,
      'Service': e.service,
      'Téléphone': e.telephone || '',
      'Email': e.email || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employes_ORMVAO');
    XLSX.writeFile(wb, `Employes_ORMVAO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        const list = rows.map((r) => ({
          matricule: r.Matricule || r.matricule || `M-${Math.floor(1000 + Math.random() * 9000)}`,
          nom: r.Nom || r.nom || 'NOM',
          prenom: r.Prénom || r.prenom || '',
          grade: r.Grade || r.grade || 'Technicien',
          fonction: r.Fonction || r.fonction || 'Agent',
          service: r.Service || r.service || 'SAF',
          telephone: r.Téléphone || r.telephone || null,
          email: r.Email || r.email || null,
        }));

        const res = await fetch('/api/employees/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ list }),
        });

        if (res.ok) {
          alert(`Importation réussie de ${list.length} employé(s) !`);
          fetchEmployees();
        } else {
          alert('Erreur lors de l\'importation');
        }
      } catch (err) {
        alert('Format de fichier Excel non reconnu');
      }
    };
    reader.readAsBinaryString(file);
  };

  const filtered = employees.filter((e) => {
    if (selectedService !== 'TOUS' && e.service !== selectedService) return false;
    const q = search.toLowerCase();
    return (
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.matricule.toLowerCase().includes(q) ||
      e.fonction.toLowerCase().includes(q) ||
      e.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Référentiel des Employés de l'ORMVAO
          </h2>
          <p className="text-xs text-slate-500">
            Cadres, ingénieurs et techniciens rattachés aux services SAF, SER, SVOP, SAAF et Direction
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Importer Excel</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exporter Excel</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Nouvel Employé</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule, grade..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Service :</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
          >
            <option value="TOUS">Tous les services</option>
            <option value="SAF">SAF</option>
            <option value="SER">SER</option>
            <option value="SVOP">SVOP</option>
            <option value="SAAF">SAAF</option>
            <option value="Direction">Direction</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-black text-xs border border-emerald-200">
                  {emp.matricule}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {emp.service}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900">
                {emp.nom} {emp.prenom}
              </h3>
              <p className="text-xs text-emerald-800 font-semibold mt-0.5">{emp.grade}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{emp.fonction}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-slate-500 text-[11px]">
                {emp.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.telephone}</span>
                  </div>
                )}
                {emp.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(emp)}
                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(emp.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Matricule Administratif *
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="Ex: M-1042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service de Rattachement *
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="SAF">SAF (Adm. & Financier)</option>
                    <option value="SER">SER (Équipement Rural)</option>
                    <option value="SVOP">SVOP (Vulgarisation)</option>
                    <option value="SAAF">SAAF (Aménagements & Foncier)</option>
                    <option value="Direction">Direction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: BENNANI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase text-slate-800 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Abdelkrim"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade *</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Technicien">Technicien</option>
                    <option value="Adjoint technique">Adjoint technique</option>
                    <option value="Ingénieur">Ingénieur</option>
                    <option value="Chef de service">Chef de service</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fonction *</label>
                  <input
                    type="text"
                    value={fonction}
                    onChange={(e) => setFonction(e.target.value)}
                    placeholder="Ex: Ingénieur Génie Rural"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email professionnel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@ormvao.ma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
