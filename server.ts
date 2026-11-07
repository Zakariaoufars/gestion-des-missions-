import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import {
  users,
  employees,
  vehicles,
  destinations,
  missions,
  gpsTrackingLogs,
  auditLogs,
  appSettings,
} from './src/db/schema.ts';
import { eq, desc, sql, ilike, and, or } from 'drizzle-orm';
import { seedInitialDataIfNeeded } from './src/db/seed.ts';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to log audit
async function logAudit(action: string, entite: string, entiteId: string, utilisateur: string, details: string) {
  try {
    await db.insert(auditLogs).values({
      action,
      entite,
      entiteId,
      utilisateur,
      details,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Auth Sync / Me
app.get('/api/auth/me', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      const userRecord = await getOrCreateUser(req.user.uid, req.user.email || '', req.user.name);
      return res.json({ success: true, user: userRecord });
    }
    // Return default local admin profile for easy testing if no token provided
    res.json({
      success: true,
      user: {
        id: 1,
        uid: 'default-admin-uid',
        email: 'admin.ormvao@ormvao.ma',
        displayName: 'Administrateur ORMVAO',
        role: 'ADMIN',
        service: 'Direction',
      },
    });
  } catch (err: any) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Auth failed' });
  }
});

// 2. Dashboard Statistics
app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    const allEmployees = await db.select().from(employees);
    const allVehicles = await db.select().from(vehicles);
    const allMissions = await db.select().from(missions).orderBy(desc(missions.createdAt));

    const totalEmployees = allEmployees.length;
    const totalVehicles = allVehicles.length;
    const totalMissions = allMissions.length;

    const missionsEnCours = allMissions.filter(m => m.statut === 'En cours').length;
    const missionsExecutees = allMissions.filter(m => m.statut === 'Exécutée' || m.statut === 'Clôturée').length;
    const missionsNonExecutees = allMissions.filter(m => m.statut === 'Non exécutée').length;
    const missionsValidees = allMissions.filter(m => m.statut === 'Validée').length;

    const vehiculesDisponibles = allVehicles.filter(v => v.disponibilite === 'Disponible').length;
    const vehiculesEnMission = allVehicles.filter(v => v.disponibilite === 'En mission').length;
    const vehiculesMaintenance = allVehicles.filter(v => v.etatVehicule === 'En maintenance' || v.disponibilite === 'En panne').length;

    let montantCarburantAttribue = 0;
    let quantiteCarburantAttribuee = 0;
    let quantiteCarburantConsommee = 0;

    allMissions.forEach(m => {
      montantCarburantAttribue += Number(m.montantCarburantDh) || 0;
      quantiteCarburantAttribuee += Number(m.quantiteCarburantLitres) || 0;
      quantiteCarburantConsommee += Number(m.quantiteReellementConsommee) || (m.statut === 'Clôturée' ? Number(m.quantiteCarburantLitres) : 0);
    });

    const soldeCarburantRestant = Math.max(0, quantiteCarburantAttribuee - quantiteCarburantConsommee);

    // Anomalies count
    const anomalies = allMissions.filter(m => {
      if (m.anomalieConstatee && m.anomalieConstatee.trim().length > 0) return true;
      if (m.statut === 'Clôturée' && m.distanceParcourue && m.quantiteReellementConsommee) {
        const v = allVehicles.find(veh => veh.id === m.vehicleId);
        if (v) {
          const consoTheorique = Number(v.consoTheorique);
          const consoReelle = (Number(m.quantiteReellementConsommee) / Number(m.distanceParcourue)) * 100;
          if (consoReelle > consoTheorique * 1.25) return true; // +25% surconsommation
        }
      }
      return false;
    });

    // Breakdown by service
    const serviceStats: Record<string, { missions: number; fuelDh: number; fuelLitres: number }> = {
      SAF: { missions: 0, fuelDh: 0, fuelLitres: 0 },
      SER: { missions: 0, fuelDh: 0, fuelLitres: 0 },
      SVOP: { missions: 0, fuelDh: 0, fuelLitres: 0 },
      SAAF: { missions: 0, fuelDh: 0, fuelLitres: 0 },
      Direction: { missions: 0, fuelDh: 0, fuelLitres: 0 },
    };

    allMissions.forEach(m => {
      const s = m.service || 'Direction';
      if (!serviceStats[s]) {
        serviceStats[s] = { missions: 0, fuelDh: 0, fuelLitres: 0 };
      }
      serviceStats[s].missions += 1;
      serviceStats[s].fuelDh += Number(m.montantCarburantDh) || 0;
      serviceStats[s].fuelLitres += Number(m.quantiteCarburantLitres) || 0;
    });

    // Monthly stats (last 6 months)
    const monthlyStats: Array<{ month: string; missions: number; fuelDh: number; fuelLitres: number }> = [
      { month: 'Juin', missions: 14, fuelDh: 11200, fuelLitres: 860 },
      { month: 'Juil', missions: 18, fuelDh: 14400, fuelLitres: 1105 },
      { month: 'Août', missions: 12, fuelDh: 9800, fuelLitres: 755 },
      { month: 'Sept', missions: 22, fuelDh: 17600, fuelLitres: 1350 },
      { month: 'Oct', missions: 26, fuelDh: 20800, fuelLitres: 1600 },
      { month: 'Nov', missions: allMissions.length, fuelDh: Math.round(montantCarburantAttribue), fuelLitres: Math.round(quantiteCarburantAttribuee) },
    ];

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalVehicles,
        totalMissions,
        missionsEnCours,
        missionsExecutees,
        missionsNonExecutees,
        missionsValidees,
        vehiculesDisponibles,
        vehiculesEnMission,
        vehiculesMaintenance,
        montantCarburantAttribue: Math.round(montantCarburantAttribue * 100) / 100,
        quantiteCarburantAttribuee: Math.round(quantiteCarburantAttribuee * 10) / 10,
        quantiteCarburantConsommee: Math.round(quantiteCarburantConsommee * 10) / 10,
        soldeCarburantRestant: Math.round(soldeCarburantRestant * 10) / 10,
        anomaliesCount: anomalies.length,
        anomaliesList: anomalies.slice(0, 5),
        serviceStats,
        monthlyStats,
      },
    });
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to compute dashboard stats' });
  }
});

// 3. Employees CRUD & Smart Search
app.get('/api/employees', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    const service = req.query.service as string | undefined;

    let query = db.select().from(employees);
    const conditions = [];

    if (q && q.trim().length > 0) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(employees.nom, term),
          ilike(employees.prenom, term),
          ilike(employees.matricule, term),
          ilike(employees.fonction, term)
        )
      );
    }

    if (service && service !== 'TOUS') {
      conditions.push(eq(employees.service, service));
    }

    let results;
    if (conditions.length > 0) {
      results = await db.select().from(employees).where(and(...conditions)).orderBy(employees.nom);
    } else {
      results = await db.select().from(employees).orderBy(employees.nom);
    }

    res.json({ success: true, employees: results });
  } catch (err: any) {
    console.error('Failed to list employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { matricule, nom, prenom, grade, fonction, service, telephone, email } = req.body;
    if (!matricule || !nom || !prenom || !grade || !service) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (matricule, nom, prenom, grade, service)' });
    }

    const created = await db.insert(employees).values({
      matricule: matricule.trim().toUpperCase(),
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      grade,
      fonction: fonction || grade,
      service,
      telephone,
      email,
      actif: true,
    }).returning();

    await logAudit('CREATE', 'EMPLOYE', matricule, req.user?.email || 'Admin', `Ajout de l'employé ${nom} ${prenom} (${matricule})`);

    res.status(201).json({ success: true, employee: created[0] });
  } catch (err: any) {
    console.error('Failed to create employee:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la création de l\'employé' });
  }
});

app.put('/api/employees/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, prenom, grade, fonction, service, telephone, email, actif } = req.body;

    const updated = await db.update(employees)
      .set({
        nom: nom?.trim().toUpperCase(),
        prenom: prenom?.trim(),
        grade,
        fonction,
        service,
        telephone,
        email,
        actif: actif !== undefined ? actif : true,
      })
      .where(eq(employees.id, id))
      .returning();

    await logAudit('UPDATE', 'EMPLOYE', String(id), req.user?.email || 'Admin', `Modification de l'employé ${nom} ${prenom}`);

    res.json({ success: true, employee: updated[0] });
  } catch (err: any) {
    console.error('Failed to update employee:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

app.delete('/api/employees/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();
    await logAudit('DELETE', 'EMPLOYE', String(id), req.user?.email || 'Admin', `Suppression employé ID ${id}`);
    res.json({ success: true, employee: deleted[0] });
  } catch (err: any) {
    console.error('Failed to delete employee:', err);
    res.status(500).json({ error: 'Impossible de supprimer l\'employé (lié à des missions)' });
  }
});

// Bulk import employees
app.post('/api/employees/bulk-import', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { list } = req.body;
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ error: 'Liste d\'employés vide ou invalide' });
    }

    let insertedCount = 0;
    for (const item of list) {
      if (item.matricule && item.nom) {
        await db.insert(employees)
          .values({
            matricule: String(item.matricule).trim().toUpperCase(),
            nom: String(item.nom).trim().toUpperCase(),
            prenom: String(item.prenom || '').trim(),
            grade: String(item.grade || 'Technicien'),
            fonction: String(item.fonction || item.grade || 'Agent'),
            service: String(item.service || 'SAF'),
            telephone: item.telephone ? String(item.telephone) : null,
            email: item.email ? String(item.email) : null,
            actif: true,
          })
          .onConflictDoNothing();
        insertedCount++;
      }
    }

    await logAudit('IMPORT', 'EMPLOYE', `Total: ${insertedCount}`, req.user?.email || 'Admin', `Importation Excel de ${insertedCount} employés`);
    res.json({ success: true, count: insertedCount });
  } catch (err: any) {
    console.error('Bulk import employees error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'importation' });
  }
});

// 4. Vehicles CRUD & Smart Search
app.get('/api/vehicles', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    const dispo = req.query.disponibilite as string | undefined;

    const conditions = [];
    if (q && q.trim().length > 0) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(vehicles.immatriculation, term),
          ilike(vehicles.marque, term),
          ilike(vehicles.modele, term),
          ilike(vehicles.identifiantGps, term)
        )
      );
    }

    if (dispo && dispo !== 'TOUS') {
      conditions.push(eq(vehicles.disponibilite, dispo));
    }

    let results;
    if (conditions.length > 0) {
      results = await db.select().from(vehicles).where(and(...conditions)).orderBy(vehicles.immatriculation);
    } else {
      results = await db.select().from(vehicles).orderBy(vehicles.immatriculation);
    }

    res.json({ success: true, vehicles: results });
  } catch (err: any) {
    console.error('Failed to list vehicles:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
});

app.post('/api/vehicles', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      immatriculation,
      marque,
      modele,
      typeVehicule,
      typeCarburant,
      consoTheorique,
      kilometrage,
      identifiantGps,
      etatVehicule,
      disponibilite,
      niveauReservoirActuel,
    } = req.body;

    if (!immatriculation || !marque || !modele || !typeVehicule) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const created = await db.insert(vehicles).values({
      immatriculation: immatriculation.trim().toUpperCase(),
      marque: marque.trim(),
      modele: modele.trim(),
      typeVehicule,
      typeCarburant: typeCarburant || 'Diesel',
      consoTheorique: String(consoTheorique || '7.5'),
      consoReelleGps: String(consoTheorique || '7.5'),
      kilometrage: parseInt(kilometrage || 0),
      identifiantGps: identifiantGps || `GPS-ORM-${Math.floor(100 + Math.random() * 900)}`,
      etatVehicule: etatVehicule || 'Bon',
      disponibilite: disponibilite || 'Disponible',
      niveauReservoirActuel: niveauReservoirActuel || '1/2',
    }).returning();

    await logAudit('CREATE', 'VEHICULE', immatriculation, req.user?.email || 'Admin', `Ajout du véhicule ${marque} ${modele} (${immatriculation})`);

    res.status(201).json({ success: true, vehicle: created[0] });
  } catch (err: any) {
    console.error('Failed to create vehicle:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de l\'ajout du véhicule' });
  }
});

app.put('/api/vehicles/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const {
      marque,
      modele,
      typeVehicule,
      typeCarburant,
      consoTheorique,
      kilometrage,
      identifiantGps,
      etatVehicule,
      disponibilite,
      niveauReservoirActuel,
    } = req.body;

    const updated = await db.update(vehicles)
      .set({
        marque,
        modele,
        typeVehicule,
        typeCarburant,
        consoTheorique: consoTheorique ? String(consoTheorique) : undefined,
        kilometrage: kilometrage !== undefined ? parseInt(kilometrage) : undefined,
        identifiantGps,
        etatVehicule,
        disponibilite,
        niveauReservoirActuel,
      })
      .where(eq(vehicles.id, id))
      .returning();

    await logAudit('UPDATE', 'VEHICULE', String(id), req.user?.email || 'Admin', `Mise à jour véhicule ID ${id}`);

    res.json({ success: true, vehicle: updated[0] });
  } catch (err: any) {
    console.error('Failed to update vehicle:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
  }
});

app.delete('/api/vehicles/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    await logAudit('DELETE', 'VEHICULE', String(id), req.user?.email || 'Admin', `Suppression du véhicule ID ${id}`);
    res.json({ success: true, vehicle: deleted[0] });
  } catch (err: any) {
    console.error('Failed to delete vehicle:', err);
    res.status(500).json({ error: 'Impossible de supprimer le véhicule (lié à des missions)' });
  }
});

// 5. Destinations CRUD & Moroccan Geographic Database
app.get('/api/destinations', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    let results;

    if (q && q.trim().length > 0) {
      const term = `%${q.trim()}%`;
      results = await db.select().from(destinations).where(
        or(
          ilike(destinations.villeOuLocalite, term),
          ilike(destinations.commune, term),
          ilike(destinations.province, term),
          ilike(destinations.region, term)
        )
      ).orderBy(destinations.province, destinations.villeOuLocalite);
    } else {
      results = await db.select().from(destinations).orderBy(destinations.province, destinations.villeOuLocalite);
    }

    res.json({ success: true, destinations: results });
  } catch (err: any) {
    console.error('Failed to list destinations:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des destinations' });
  }
});

app.post('/api/destinations', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { region, province, commune, villeOuLocalite, zoneAdministrative, distanceAllerKm } = req.body;
    if (!villeOuLocalite || !province) {
      return res.status(400).json({ error: 'Localité et province obligatoires' });
    }

    const created = await db.insert(destinations).values({
      region: region || 'Drâa-Tafilalet',
      province: province.trim(),
      commune: commune || villeOuLocalite,
      villeOuLocalite: villeOuLocalite.trim(),
      zoneAdministrative: zoneAdministrative || 'Zone Administrative ORMVAO',
      distanceAllerKm: parseInt(distanceAllerKm || 50),
    }).returning();

    await logAudit('CREATE', 'DESTINATION', villeOuLocalite, req.user?.email || 'Admin', `Ajout destination ${villeOuLocalite} (${province})`);

    res.status(201).json({ success: true, destination: created[0] });
  } catch (err: any) {
    console.error('Failed to create destination:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la destination' });
  }
});

// 6. Missions Workflow & Automated Administrative Generation
app.get('/api/missions', async (req: Request, res: Response) => {
  try {
    const { statut, service, search } = req.query;

    const conditions = [];
    if (statut && statut !== 'TOUS') {
      conditions.push(eq(missions.statut, statut as string));
    }
    if (service && service !== 'TOUS') {
      conditions.push(eq(missions.service, service as string));
    }
    if (search && (search as string).trim().length > 0) {
      const term = `%${(search as string).trim()}%`;
      conditions.push(
        or(
          ilike(missions.numeroMission, term),
          ilike(missions.employeeNom, term),
          ilike(missions.employeeMatricule, term),
          ilike(missions.vehicleImmat, term),
          ilike(missions.destination, term)
        )
      );
    }

    let results;
    if (conditions.length > 0) {
      results = await db.select().from(missions).where(and(...conditions)).orderBy(desc(missions.id));
    } else {
      results = await db.select().from(missions).orderBy(desc(missions.id));
    }

    res.json({ success: true, missions: results });
  } catch (err: any) {
    console.error('Failed to list missions:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des missions' });
  }
});

app.get('/api/missions/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const mission = await db.select().from(missions).where(eq(missions.id, id));
    if (mission.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Also fetch associated GPS logs
    const gpsLogs = await db.select().from(gpsTrackingLogs)
      .where(eq(gpsTrackingLogs.vehicleId, mission[0].vehicleId || 0))
      .orderBy(desc(gpsTrackingLogs.timestamp))
      .limit(20);

    res.json({ success: true, mission: mission[0], gpsLogs });
  } catch (err: any) {
    console.error('Failed to get mission:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la mission' });
  }
});

// Smart Mission Creation (One Single Entry = Everything Auto-Generated)
app.post('/api/missions', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      employeeId,
      destination,
      destinationProvince,
      objetMission,
      dateDebut,
      dateFin,
      vehicleId,
      montantCarburantDh,
      quantiteCarburantLitres,
      niveauCarburantInitial,
      typeVignette,
      service,
      notes,
    } = req.body;

    if (!employeeId || !destination || !objetMission || !dateDebut || !dateFin || !vehicleId) {
      return res.status(400).json({ error: 'Informations obligatoires incomplètes' });
    }

    // 1. Fetch Employee Snapshot
    const empList = await db.select().from(employees).where(eq(employees.id, parseInt(employeeId)));
    if (empList.length === 0) {
      return res.status(404).json({ error: 'Employé introuvable' });
    }
    const emp = empList[0];

    // 2. Fetch Vehicle Snapshot
    const vehList = await db.select().from(vehicles).where(eq(vehicles.id, parseInt(vehicleId)));
    if (vehList.length === 0) {
      return res.status(404).json({ error: 'Véhicule introuvable' });
    }
    const veh = vehList[0];

    // 3. Generate Official Automatic Mission Number (OM-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const countMissions = await db.select({ count: sql<number>`count(*)` }).from(missions);
    const nextSeq = (Number(countMissions[0]?.count) || 0) + 1;
    const seqPadded = String(nextSeq).padStart(4, '0');
    const numeroMission = `OM-${currentYear}-${seqPadded}`;

    // 4. Generate GPS Mission Sync ID
    const gpsSyncId = `GPS-SYNC-${Math.floor(10000 + Math.random() * 90000)}`;

    const userEmail = req.user?.email || 'Driss AMRAOUI (Directeur ORMVAO)';

    // 5. Insert Mission
    const created = await db.insert(missions).values({
      numeroMission,
      employeeId: emp.id,
      employeeNom: `${emp.nom} ${emp.prenom}`,
      employeeMatricule: emp.matricule,
      employeeGrade: emp.grade,
      employeeService: emp.service,
      employeeFonction: emp.fonction,
      destination,
      destinationProvince: destinationProvince || '',
      objetMission,
      dateDebut,
      dateFin,
      vehicleId: veh.id,
      vehicleImmat: veh.immatriculation,
      vehicleMarqueModele: `${veh.marque} ${veh.modele}`,
      kmInitial: veh.kilometrage,
      montantCarburantDh: String(montantCarburantDh || 0),
      quantiteCarburantLitres: String(quantiteCarburantLitres || 0),
      niveauCarburantInitial: niveauCarburantInitial || veh.niveauReservoirActuel || '1/2',
      typeVignette: typeVignette || 'Vignette simple',
      service: service || emp.service,
      statut: 'Validée', // Directement validée et prête pour émission des documents administratifs
      gpsSyncId,
      validePar: userEmail,
      valideAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes,
    }).returning();

    // 6. Update Vehicle state to 'En mission'
    await db.update(vehicles)
      .set({ disponibilite: 'En mission' })
      .where(eq(vehicles.id, veh.id));

    // 7. Generate telemetry position mock for GPS
    await db.insert(gpsTrackingLogs).values({
      vehicleId: veh.id,
      missionId: created[0].id,
      vehicleImmat: veh.immatriculation,
      latitude: '30.9238',
      longitude: '-6.9142', // Ouarzazate Headquarters departure point
      vitesse: 0,
      distanceParcourue: '0',
      niveauCarburant: niveauCarburantInitial || '1/2',
      consommationInstantanee: '0',
      statutGps: 'Départ Mission',
    });

    // 8. Audit log
    await logAudit(
      'CREATE_MISSION',
      'MISSION',
      numeroMission,
      userEmail,
      `Création et validation automatique de la mission ${numeroMission} pour ${emp.nom} ${emp.prenom} vers ${destination}`
    );

    res.status(201).json({
      success: true,
      mission: created[0],
      message: 'Mission créée avec succès. Ordre de mission et bons administratifs générés automatiquement.',
    });
  } catch (err: any) {
    console.error('Mission creation error:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la création de la mission' });
  }
});

// Update mission status (e.g. En cours, Clôturée)
app.put('/api/missions/:id/status', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;
    if (!statut) return res.status(400).json({ error: 'Statut requis' });

    const missionList = await db.select().from(missions).where(eq(missions.id, id));
    if (missionList.length === 0) return res.status(404).json({ error: 'Mission introuvable' });
    const current = missionList[0];

    const updated = await db.update(missions)
      .set({ statut })
      .where(eq(missions.id, id))
      .returning();

    if (statut === 'En cours' && current.vehicleId) {
      await db.update(vehicles).set({ disponibilite: 'En mission' }).where(eq(vehicles.id, current.vehicleId));
    } else if ((statut === 'Clôturée' || statut === 'Non exécutée') && current.vehicleId) {
      await db.update(vehicles).set({ disponibilite: 'Disponible' }).where(eq(vehicles.id, current.vehicleId));
    }

    await logAudit('STATUS_CHANGE', 'MISSION', current.numeroMission, req.user?.email || 'Admin', `Changement de statut vers "${statut}"`);

    res.json({ success: true, mission: updated[0] });
  } catch (err: any) {
    console.error('Error updating mission status:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Close mission with fuel and mileage audit
app.post('/api/missions/:id/close', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { kmFinal, quantiteReellementConsommee, niveauCarburantFinal, anomalieConstatee, notes } = req.body;

    const missionList = await db.select().from(missions).where(eq(missions.id, id));
    if (missionList.length === 0) return res.status(404).json({ error: 'Mission introuvable' });
    const m = missionList[0];

    const finalKm = parseInt(kmFinal) || (m.kmInitial + 100);
    const distanceParcourue = Math.max(0, finalKm - m.kmInitial);
    const qteConsommee = Number(quantiteReellementConsommee) || Number(m.quantiteCarburantLitres);

    // Calculate real average consumption: (litres / distance) * 100
    let consoMoyenne = 0;
    if (distanceParcourue > 0) {
      consoMoyenne = Math.round((qteConsommee / distanceParcourue) * 100 * 10) / 10;
    }

    const updated = await db.update(missions)
      .set({
        kmFinal: finalKm,
        distanceParcourue,
        quantiteReellementConsommee: String(qteConsommee),
        consommationMoyenne: String(consoMoyenne),
        niveauCarburantFinal: niveauCarburantFinal || '1/2',
        statut: 'Clôturée',
        clotureAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        anomalieConstatee: anomalieConstatee || null,
        notes: notes ? `${m.notes ? m.notes + '\n' : ''}${notes}` : m.notes,
      })
      .where(eq(missions.id, id))
      .returning();

    // Release vehicle & update vehicle mileage
    if (m.vehicleId) {
      await db.update(vehicles)
        .set({
          kilometrage: finalKm,
          disponibilite: 'Disponible',
          niveauReservoirActuel: niveauCarburantFinal || '1/2',
          consoReelleGps: consoMoyenne > 0 ? String(consoMoyenne) : undefined,
        })
        .where(eq(vehicles.id, m.vehicleId));
    }

    await logAudit(
      'CLOSE_MISSION',
      'MISSION',
      m.numeroMission,
      req.user?.email || 'Admin',
      `Clôture mission: ${distanceParcourue} km parcourus, ${qteConsommee} L consommés (moy: ${consoMoyenne} L/100km)`
    );

    res.json({
      success: true,
      mission: updated[0],
      message: 'Mission clôturée avec succès. Parc automobile et bilan carburant actualisés.',
    });
  } catch (err: any) {
    console.error('Error closing mission:', err);
    res.status(500).json({ error: 'Erreur lors de la clôture de la mission' });
  }
});

// 7. Fuel Tracking & Control Ledger
app.get('/api/fuel/ledger', async (_req: Request, res: Response) => {
  try {
    const allMissions = await db.select().from(missions).orderBy(desc(missions.id));
    const allVehicles = await db.select().from(vehicles);

    const vehicleMap = new Map<number, any>();
    allVehicles.forEach(v => vehicleMap.set(v.id, v));

    const ledger = allMissions.map(m => {
      const v = m.vehicleId ? vehicleMap.get(m.vehicleId) : null;
      const qteAttribuee = Number(m.quantiteCarburantLitres) || 0;
      const qteConsommee = m.quantiteReellementConsommee ? Number(m.quantiteReellementConsommee) : 0;
      const soldeLitres = Math.round((qteAttribuee - qteConsommee) * 10) / 10;
      const dist = m.distanceParcourue || (m.kmFinal && m.kmInitial ? m.kmFinal - m.kmInitial : 0);
      const consoMoyenne = m.consommationMoyenne ? Number(m.consommationMoyenne) : (dist > 0 && qteConsommee > 0 ? Math.round((qteConsommee / dist) * 100 * 10) / 10 : 0);
      const consoTheorique = v ? Number(v.consoTheorique) : 7.5;
      const ecartTheorique = consoMoyenne > 0 ? Math.round((consoMoyenne - consoTheorique) * 10) / 10 : 0;

      let alerte = null;
      if (m.anomalieConstatee) {
        alerte = m.anomalieConstatee;
      } else if (ecartTheorique > 1.8) {
        alerte = `Surconsommation détectée (+${ecartTheorique} L/100km par rapport à la norme)`;
      } else if (m.statut === 'Non exécutée' && qteAttribuee > 0) {
        alerte = 'Mission non exécutée avec dotation carburant non réintégrée';
      }

      return {
        id: m.id,
        numeroMission: m.numeroMission,
        employeeNom: m.employeeNom,
        employeeMatricule: m.employeeMatricule,
        service: m.service,
        destination: m.destination,
        vehicleImmat: m.vehicleImmat,
        vehicleMarqueModele: m.vehicleMarqueModele,
        dateDebut: m.dateDebut,
        dateFin: m.dateFin,
        statut: m.statut,
        montantCarburantDh: Number(m.montantCarburantDh) || 0,
        quantiteAttribuee: qteAttribuee,
        niveauInitial: m.niveauCarburantInitial,
        niveauFinal: m.niveauCarburantFinal || '-',
        quantiteConsommee: qteConsommee,
        soldeLitres,
        kmInitial: m.kmInitial,
        kmFinal: m.kmFinal || '-',
        distanceParcourue: dist,
        consoTheorique,
        consoMoyenne,
        ecartTheorique,
        alerte,
      };
    });

    res.json({ success: true, ledger });
  } catch (err: any) {
    console.error('Fuel ledger error:', err);
    res.status(500).json({ error: 'Erreur lors du calcul du bilan carburant' });
  }
});

// 8. GPS Real-time Telemetry & Map Data
app.get('/api/gps/vehicles', async (_req: Request, res: Response) => {
  try {
    const allVehicles = await db.select().from(vehicles);
    const activeMissions = await db.select().from(missions).where(eq(missions.statut, 'En cours'));

    // Dynamic coordinates centered around Ouarzazate, Skoura, Zagora, Tinghir
    const markers = allVehicles.map((v, index) => {
      const activeMission = activeMissions.find(m => m.vehicleId === v.id);

      // Coordinates for demonstrator & telemetry positions in Draa-Tafilalet
      let lat = 30.9238;
      let lng = -6.9142;
      let statusText = 'À l\'arrêt (Siège ORMVAO Ouarzazate)';
      let speed = 0;

      if (v.immatriculation === '14285-WW-68') {
        lat = 31.0540;
        lng = -6.6500; // Palmeraie de Skoura
        statusText = 'En déplacement vers Palmeraie de Skoura (Mission OM-2026-0038)';
        speed = 65;
      } else if (v.immatriculation === '20411-WW-68') {
        lat = 30.6975;
        lng = -6.4485; // Vallée du Drâa / Agdz
        statusText = 'En déplacement vers Zagora (Mission OM-2026-0041)';
        speed = 72;
      } else if (v.immatriculation === '16892-A-68') {
        lat = 30.9245;
        lng = -6.9150;
        statusText = 'Stationné au parking ORMVAO Ouarzazate';
        speed = 0;
      } else if (v.immatriculation === '19304-B-68') {
        lat = 30.9260;
        lng = -6.9130;
        statusText = 'Garage technique ORMVAO';
        speed = 0;
      } else if (v.immatriculation === '22501-A-68') {
        lat = 31.2200;
        lng = -6.1300; // Kalaat M\'gouna
        statusText = 'Arrêt temporaire Kalaat M\'gouna';
        speed = 0;
      } else {
        lat = 30.9238 + (index * 0.008);
        lng = -6.9142 + (index * 0.008);
      }

      return {
        vehicleId: v.id,
        immatriculation: v.immatriculation,
        marqueModele: `${v.marque} ${v.modele}`,
        typeVehicule: v.typeVehicule,
        typeCarburant: v.typeCarburant,
        consoTheorique: v.consoTheorique,
        consoReelleGps: v.consoReelleGps,
        kilometrage: v.kilometrage,
        identifiantGps: v.identifiantGps,
        disponibilite: v.disponibilite,
        etatVehicule: v.etatVehicule,
        niveauReservoir: v.niveauReservoirActuel,
        latitude: lat,
        longitude: lng,
        vitesse: speed,
        statutTelemetrie: statusText,
        missionActive: activeMission ? {
          numeroMission: activeMission.numeroMission,
          employe: activeMission.employeeNom,
          destination: activeMission.destination,
        } : null,
      };
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      provider: 'Connecteur Télématique ORMVAO (OpenAPI / REST)',
      center: { lat: 30.9238, lng: -6.9142, zoom: 9 },
      vehicles: markers,
    });
  } catch (err: any) {
    console.error('GPS telemetry error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données GPS' });
  }
});

// GPS mission route simulator / playback
app.get('/api/gps/route/:missionId', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const m = await db.select().from(missions).where(eq(missions.id, missionId));
    if (m.length === 0) return res.status(404).json({ error: 'Mission introuvable' });

    // Realistic waypoints for Ouarzazate to destination
    const waypoints = [
      { lat: 30.9238, lng: -6.9142, label: 'Siège ORMVAO Ouarzazate (Départ)', time: '08:00', speed: 0 },
      { lat: 30.9410, lng: -6.8520, label: 'Sortie Ouarzazate RN10', time: '08:15', speed: 68 },
      { lat: 31.0200, lng: -6.7100, label: 'Traversée Oued Izerki', time: '08:35', speed: 75 },
      { lat: 31.0540, lng: -6.6500, label: 'Arrivée Palmeraie de Skoura', time: '09:00', speed: 45 },
    ];

    res.json({ success: true, mission: m[0], waypoints });
  } catch (err: any) {
    console.error('GPS route error:', err);
    res.status(500).json({ error: 'Erreur tracé GPS' });
  }
});

// 9. Document Data Retrieval for High-Fidelity Rendering (A5 & A4)
app.get('/api/documents/:missionId', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const m = await db.select().from(missions).where(eq(missions.id, missionId));
    if (m.length === 0) return res.status(404).json({ error: 'Mission non trouvée' });

    const settingsRecord = await db.select().from(appSettings).where(eq(appSettings.key, 'organization'));
    const orgData = settingsRecord.length > 0 ? JSON.parse(settingsRecord[0].value) : {
      nomEtablissement: 'Office Régional de Mise en Valeur Agricole de Ouarzazate',
      sigle: 'ORMVAO',
      tutelle: 'Ministère de l\'Agriculture, de la Pêche Maritime, du Développement Rural et des Eaux et Forêts',
    };

    res.json({
      success: true,
      mission: m[0],
      organization: orgData,
      generatedAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    });
  } catch (err: any) {
    console.error('Document error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération des documents' });
  }
});

// 10. Audit Logs
app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.id)).limit(50);
    res.json({ success: true, logs });
  } catch (err: any) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Erreur journal des opérations' });
  }
});

// 11. Settings
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const all = await db.select().from(appSettings);
    const map: Record<string, any> = {};
    all.forEach(item => {
      try {
        map[item.key] = JSON.parse(item.value);
      } catch {
        map[item.key] = item.value;
      }
    });
    res.json({ success: true, settings: map });
  } catch (err: any) {
    console.error('Settings error:', err);
    res.status(500).json({ error: 'Erreur paramètres' });
  }
});

app.put('/api/settings', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Clé requise' });

    const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await db.insert(appSettings)
      .values({ key, value: stringVal })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: stringVal, updatedAt: new Date() },
      });

    await logAudit('SETTINGS', 'CONFIGURATION', key, req.user?.email || 'Admin', `Mise à jour paramètre: ${key}`);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Erreur enregistrement paramètre' });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS
// -------------------------------------------------------------

async function startServer() {
  // Seed database initially if required
  await seedInitialDataIfNeeded();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ORMVAO ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
