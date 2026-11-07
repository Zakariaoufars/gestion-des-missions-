import { db } from './index.ts';
import { employees, vehicles, destinations, missions, gpsTrackingLogs, appSettings, auditLogs } from './schema.ts';

export async function seedInitialDataIfNeeded() {
  try {
    const existingEmployees = await db.select().from(employees);
    if (existingEmployees.length > 0) {
      console.log('Database already has records, skipping initial seed.');
      return;
    }

    console.log('Seeding initial ORMVAO data...');

    // 1. Employees
    const seededEmployees = await db.insert(employees).values([
      {
        matricule: 'M-1042',
        nom: 'EL ALAMI',
        prenom: 'Mohamed',
        grade: 'Chef de service',
        fonction: 'Chef du Service Administratif et Financier',
        service: 'SAF',
        telephone: '+212 661-452189',
        email: 'm.elalami@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-1105',
        nom: 'BENNANI',
        prenom: 'Abdelkrim',
        grade: 'Ingénieur',
        fonction: 'Ingénieur en Génie Rural - Réseaux d\'irrigation',
        service: 'SER',
        telephone: '+212 662-789012',
        email: 'a.bennani@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-1530',
        nom: 'BOUSSAID',
        prenom: 'Khadija',
        grade: 'Ingénieur',
        fonction: 'Ingénieur Agronome - Filières Arboriculture & Dattier',
        service: 'SVOP',
        telephone: '+212 663-123456',
        email: 'k.boussaid@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-2451',
        nom: 'AIT LAHCEN',
        prenom: 'Rachid',
        grade: 'Technicien',
        fonction: 'Technicien Hydraulicien de terrain',
        service: 'SER',
        telephone: '+212 664-987654',
        email: 'r.aitlahcen@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-1088',
        nom: 'TAZI',
        prenom: 'Hassan',
        grade: 'Chef de service',
        fonction: 'Chef du Service des Aménagements Agricoles et Foncier',
        service: 'SAAF',
        telephone: '+212 661-345678',
        email: 'h.tazi@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-2180',
        nom: 'OUARZAZI',
        prenom: 'Fatima Zahra',
        grade: 'Technicien',
        fonction: 'Gestionnaire des fournitures et logistique',
        service: 'SAF',
        telephone: '+212 665-234567',
        email: 'fz.ouarzazi@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-3012',
        nom: 'IDRISSI',
        prenom: 'Youssef',
        grade: 'Adjoint technique',
        fonction: 'Conducteur et agent technique polyvalent',
        service: 'Direction',
        telephone: '+212 667-890123',
        email: 'y.idrissi@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-2890',
        nom: 'OUHMAD',
        prenom: 'Brahim',
        grade: 'Technicien',
        fonction: 'Conseiller agricole de proximité',
        service: 'SVOP',
        telephone: '+212 666-567890',
        email: 'b.ouhmad@ormvao.ma',
        actif: true,
      },
      {
        matricule: 'M-1001',
        nom: 'AMRAOUI',
        prenom: 'Driss',
        grade: 'Chef de service',
        fonction: 'Directeur de l\'ORMVAO',
        service: 'Direction',
        telephone: '+212 661-000001',
        email: 'directeur@ormvao.ma',
        actif: true,
      },
    ]).returning();

    // 2. Vehicles
    const seededVehicles = await db.insert(vehicles).values([
      {
        immatriculation: '14285-WW-68',
        marque: 'Dacia',
        modele: 'Duster 4x4 Confort',
        typeVehicule: 'Tout-terrain',
        typeCarburant: 'Diesel',
        consoTheorique: '6.4',
        consoReelleGps: '6.7',
        kilometrage: 84250,
        identifiantGps: 'GPS-ORM-001',
        etatVehicule: 'Bon',
        disponibilite: 'En mission',
        niveauReservoirActuel: '1/2',
      },
      {
        immatriculation: '16892-A-68',
        marque: 'Toyota',
        modele: 'Hilux Double Cabine 4x4',
        typeVehicule: 'Pick-up 4x4',
        typeCarburant: 'Diesel',
        consoTheorique: '8.8',
        consoReelleGps: '9.1',
        kilometrage: 126400,
        identifiantGps: 'GPS-ORM-002',
        etatVehicule: 'Excellent',
        disponibilite: 'Disponible',
        niveauReservoirActuel: '3/4',
      },
      {
        immatriculation: '19304-B-68',
        marque: 'Renault',
        modele: 'Kangoo Express',
        typeVehicule: 'Utilitaire',
        typeCarburant: 'Diesel',
        consoTheorique: '5.6',
        consoReelleGps: '5.9',
        kilometrage: 62150,
        identifiantGps: 'GPS-ORM-003',
        etatVehicule: 'Bon',
        disponibilite: 'Disponible',
        niveauReservoirActuel: '1/2',
      },
      {
        immatriculation: '20411-WW-68',
        marque: 'Isuzu',
        modele: 'D-Max 4x4',
        typeVehicule: 'Pick-up 4x4',
        typeCarburant: 'Diesel',
        consoTheorique: '8.2',
        consoReelleGps: '8.5',
        kilometrage: 91320,
        identifiantGps: 'GPS-ORM-004',
        etatVehicule: 'Bon',
        disponibilite: 'En mission',
        niveauReservoirActuel: '1/4',
      },
      {
        immatriculation: '22501-A-68',
        marque: 'Peugeot',
        modele: 'Landtrek 4x4',
        typeVehicule: 'Pick-up 4x4',
        typeCarburant: 'Diesel',
        consoTheorique: '8.6',
        consoReelleGps: '8.9',
        kilometrage: 45800,
        identifiantGps: 'GPS-ORM-005',
        etatVehicule: 'Excellent',
        disponibilite: 'Disponible',
        niveauReservoirActuel: '1/1',
      },
      {
        immatriculation: '11240-M-68',
        marque: 'Toyota',
        modele: 'Land Cruiser Prado',
        typeVehicule: 'Tout-terrain',
        typeCarburant: 'Diesel',
        consoTheorique: '10.2',
        consoReelleGps: '10.6',
        kilometrage: 178200,
        identifiantGps: 'GPS-ORM-006',
        etatVehicule: 'Bon',
        disponibilite: 'Disponible',
        niveauReservoirActuel: '3/4',
      },
    ]).returning();

    // 3. Destinations
    await db.insert(destinations).values([
      // Ouarzazate & Environs
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Ouarzazate', villeOuLocalite: 'Ouarzazate Centre', zoneAdministrative: 'Siège ORMVAO', distanceAllerKm: 5 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Skoura', villeOuLocalite: 'Skoura Ahl El Oust (Palmeraie)', zoneAdministrative: 'Périmètre Irrigué Ouarzazate', distanceAllerKm: 42 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Tazenakht', villeOuLocalite: 'Tazenakht Centre', zoneAdministrative: 'Zone Pastorale et Foncier', distanceAllerKm: 85 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Aït Benhaddou', villeOuLocalite: 'Ksar Aït Benhaddou', zoneAdministrative: 'Périmètre Ounila', distanceAllerKm: 32 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Amerzgane', villeOuLocalite: 'Amerzgane Centre', zoneAdministrative: 'Haut Ounila', distanceAllerKm: 45 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Ghassate', villeOuLocalite: 'Ghassate - Noor Ouarzazate', zoneAdministrative: 'Zone Énergie & Eau', distanceAllerKm: 38 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Tabounte', villeOuLocalite: 'Tabounte / Tarmigt', zoneAdministrative: 'Périurbain Ouarzazate', distanceAllerKm: 8 },
      { region: 'Drâa-Tafilalet', province: 'Ouarzazate', commune: 'Iznaguen', villeOuLocalite: 'Iznaguen (Massif du Siroua)', zoneAdministrative: 'Zone Safran', distanceAllerKm: 98 },
      // Zagora & Vallée du Drâa
      { region: 'Drâa-Tafilalet', province: 'Zagora', commune: 'Zagora', villeOuLocalite: 'Zagora Ville', zoneAdministrative: 'Moyen Drâa', distanceAllerKm: 162 },
      { region: 'Drâa-Tafilalet', province: 'Zagora', commune: 'Agdz', villeOuLocalite: 'Agdz Centre', zoneAdministrative: 'Haut Drâa', distanceAllerKm: 68 },
      { region: 'Drâa-Tafilalet', province: 'Zagora', commune: 'Tagounite', villeOuLocalite: 'Tagounite Centre', zoneAdministrative: 'Bas Drâa', distanceAllerKm: 230 },
      { region: 'Drâa-Tafilalet', province: 'Zagora', commune: 'M\'Hamid El Ghizlane', villeOuLocalite: 'M\'Hamid Oasis', zoneAdministrative: 'Frontière Saharienne', distanceAllerKm: 260 },
      // Tinghir & Vallée du Dadès
      { region: 'Drâa-Tafilalet', province: 'Tinghir', commune: 'Tinghir', villeOuLocalite: 'Tinghir Centre / Todgha', zoneAdministrative: 'Vallée du Todgha', distanceAllerKm: 165 },
      { region: 'Drâa-Tafilalet', province: 'Tinghir', commune: 'Kalaat M\'gouna', villeOuLocalite: 'Kalaat M\'gouna (Vallée des Roses)', zoneAdministrative: 'Périmètre Dadès', distanceAllerKm: 92 },
      { region: 'Drâa-Tafilalet', province: 'Tinghir', commune: 'Boumalne Dadès', villeOuLocalite: 'Boumalne Dadès Centre', zoneAdministrative: 'Gorges du Dadès', distanceAllerKm: 115 },
      // Errachidia & Ziz
      { region: 'Drâa-Tafilalet', province: 'Errachidia', commune: 'Errachidia', villeOuLocalite: 'Errachidia Siège DRA', zoneAdministrative: 'Direction Régionale Agriculture', distanceAllerKm: 310 },
      { region: 'Drâa-Tafilalet', province: 'Errachidia', commune: 'Erfoud', villeOuLocalite: 'Erfoud Centre / Rissani', zoneAdministrative: 'Palmeraie Tafilalet', distanceAllerKm: 335 },
      // Destinations Nationales
      { region: 'Rabat-Salé-Kénitra', province: 'Rabat', commune: 'Rabat', villeOuLocalite: 'Rabat - Ministère de l\'Agriculture', zoneAdministrative: 'Administration Centrale', distanceAllerKm: 520 },
      { region: 'Marrakech-Safi', province: 'Marrakech', commune: 'Marrakech', villeOuLocalite: 'Marrakech Gueliz', zoneAdministrative: 'Partenariats & Coordination', distanceAllerKm: 198 },
      { region: 'Souss-Massa', province: 'Agadir-Ida-Ou-Tanane', commune: 'Agadir', villeOuLocalite: 'Agadir ORMVA Souss-Massa', zoneAdministrative: 'Échange Inter-ORMVA', distanceAllerKm: 360 },
    ]);

    // 4. Initial Missions
    const v1 = seededVehicles[0]; // Duster
    const v4 = seededVehicles[3]; // Isuzu D-Max
    const v2 = seededVehicles[1]; // Hilux
    const v3 = seededVehicles[2]; // Kangoo

    const empBennani = seededEmployees[1];
    const empBoussaid = seededEmployees[2];
    const empAitLahcen = seededEmployees[3];
    const empOuarzazi = seededEmployees[5];

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await db.insert(missions).values([
      {
        numeroMission: 'OM-2026-0038',
        employeeId: empBennani.id,
        employeeNom: `${empBennani.nom} ${empBennani.prenom}`,
        employeeMatricule: empBennani.matricule,
        employeeGrade: empBennani.grade,
        employeeService: empBennani.service,
        employeeFonction: empBennani.fonction,
        destination: 'Skoura Ahl El Oust (Palmeraie)',
        destinationProvince: 'Ouarzazate',
        objetMission: 'Supervision des travaux de curage des seguias et modernisation du réseau d\'irrigation goutte-à-goutte',
        dateDebut: `${todayStr}T08:00`,
        dateFin: `${todayStr}T18:00`,
        vehicleId: v1.id,
        vehicleImmat: v1.immatriculation,
        vehicleMarqueModele: `${v1.marque} ${v1.modele}`,
        kmInitial: 84150,
        kmFinal: null,
        distanceParcourue: null,
        montantCarburantDh: '350.00',
        quantiteCarburantLitres: '26.9',
        niveauCarburantInitial: '1/2',
        typeVignette: 'E-vignette',
        service: 'SER',
        statut: 'En cours',
        gpsSyncId: 'GPS-SYNC-98102',
        validePar: 'Driss AMRAOUI (Directeur)',
        valideAt: `${todayStr} 07:45`,
        notes: 'Mission prioritaire plan d\'urgence sécheresse',
      },
      {
        numeroMission: 'OM-2026-0041',
        employeeId: empBoussaid.id,
        employeeNom: `${empBoussaid.nom} ${empBoussaid.prenom}`,
        employeeMatricule: empBoussaid.matricule,
        employeeGrade: empBoussaid.grade,
        employeeService: empBoussaid.service,
        employeeFonction: empBoussaid.fonction,
        destination: 'Zagora Ville & Agdz',
        destinationProvince: 'Zagora',
        objetMission: 'Campagne de vulgarisation et contrôle phytosanitaire contre le bayoud du palmier dattier',
        dateDebut: `${todayStr}T09:00`,
        dateFin: `${tomorrowStr}T17:00`,
        vehicleId: v4.id,
        vehicleImmat: v4.immatriculation,
        vehicleMarqueModele: `${v4.marque} ${v4.modele}`,
        kmInitial: 91100,
        kmFinal: null,
        distanceParcourue: null,
        montantCarburantDh: '750.00',
        quantiteCarburantLitres: '57.7',
        niveauCarburantInitial: '3/4',
        typeVignette: 'Vignette simple',
        service: 'SVOP',
        statut: 'En cours',
        gpsSyncId: 'GPS-SYNC-98105',
        validePar: 'Driss AMRAOUI (Directeur)',
        valideAt: `${todayStr} 08:15`,
        notes: 'Coopération avec coopératives phoenicicoles du Moyen Drâa',
      },
      {
        numeroMission: 'OM-2026-0035',
        employeeId: empAitLahcen.id,
        employeeNom: `${empAitLahcen.nom} ${empAitLahcen.prenom}`,
        employeeMatricule: empAitLahcen.matricule,
        employeeGrade: empAitLahcen.grade,
        employeeService: empAitLahcen.service,
        employeeFonction: empAitLahcen.fonction,
        destination: 'Kalaat M\'gouna (Vallée des Roses)',
        destinationProvince: 'Tinghir',
        objetMission: 'Maintenance préventive des stations de pompage agricole et débitmètres',
        dateDebut: '2026-11-05T08:30',
        dateFin: '2026-11-05T19:00',
        vehicleId: v3.id,
        vehicleImmat: v3.immatriculation,
        vehicleMarqueModele: `${v3.marque} ${v3.modele}`,
        kmInitial: 61950,
        kmFinal: 62150,
        distanceParcourue: 200,
        montantCarburantDh: '200.00',
        quantiteCarburantLitres: '15.4',
        niveauCarburantInitial: '3/4',
        niveauCarburantFinal: '1/2',
        typeVignette: 'E-vignette',
        service: 'SER',
        statut: 'Clôturée',
        quantiteReellementConsommee: '11.8',
        consommationMoyenne: '5.9',
        gpsSyncId: 'GPS-SYNC-97992',
        validePar: 'Abdelkrim BENNANI',
        valideAt: '2026-11-05 08:00',
        clotureAt: '2026-11-05 19:30',
        notes: 'Clôture effectuée avec succès. Économie de 3.6L constatée.',
      },
      {
        numeroMission: 'OM-2026-0042',
        employeeId: empOuarzazi.id,
        employeeNom: `${empOuarzazi.nom} ${empOuarzazi.prenom}`,
        employeeMatricule: empOuarzazi.matricule,
        employeeGrade: empOuarzazi.grade,
        employeeService: empOuarzazi.service,
        employeeFonction: empOuarzazi.fonction,
        destination: 'Marrakech - DRA Marrakech-Safi',
        destinationProvince: 'Marrakech',
        objetMission: 'Réception des fournitures informatiques et archivage centralisé du matériel cadastral',
        dateDebut: `${tomorrowStr}T07:00`,
        dateFin: `${tomorrowStr}T20:00`,
        vehicleId: v2.id,
        vehicleImmat: v2.immatriculation,
        vehicleMarqueModele: `${v2.marque} ${v2.modele}`,
        kmInitial: 126400,
        kmFinal: null,
        distanceParcourue: null,
        montantCarburantDh: '850.00',
        quantiteCarburantLitres: '65.4',
        niveauCarburantInitial: '3/4',
        typeVignette: 'E-vignette',
        service: 'SAF',
        statut: 'Validée',
        gpsSyncId: 'GPS-SYNC-98110',
        validePar: 'Mohamed EL ALAMI (Chef SAF)',
        valideAt: `${todayStr} 11:20`,
        notes: 'Documents administratifs générés prêts pour départ.',
      },
    ]);

    // 5. GPS Real-time positions for vehicles
    await db.insert(gpsTrackingLogs).values([
      {
        vehicleId: v1.id,
        vehicleImmat: v1.immatriculation,
        latitude: '31.1182',
        longitude: '-6.5524', // En route vers Skoura
        vitesse: 68,
        distanceParcourue: '38.5',
        niveauCarburant: '1/2',
        consommationInstantanee: '6.5',
        statutGps: 'En mouvement',
      },
      {
        vehicleId: v4.id,
        vehicleImmat: v4.immatriculation,
        latitude: '30.6975',
        longitude: '-6.4485', // Proche de Agdz
        vitesse: 74,
        distanceParcourue: '64.2',
        niveauCarburant: '5/8',
        consommationInstantanee: '8.4',
        statutGps: 'En mouvement',
      },
      {
        vehicleId: v2.id,
        vehicleImmat: v2.immatriculation,
        latitude: '30.9238',
        longitude: '-6.9142', // Siège ORMVAO Ouarzazate
        vitesse: 0,
        distanceParcourue: '0',
        niveauCarburant: '3/4',
        consommationInstantanee: '0',
        statutGps: 'Arrêt',
      },
      {
        vehicleId: v3.id,
        vehicleImmat: v3.immatriculation,
        latitude: '30.9250',
        longitude: '-6.9120', // Garage ORMVAO
        vitesse: 0,
        distanceParcourue: '0',
        niveauCarburant: '1/2',
        consommationInstantanee: '0',
        statutGps: 'Arrêt',
      },
    ]);

    // 6. App Settings
    await db.insert(appSettings).values([
      {
        key: 'organization',
        value: JSON.stringify({
          nomEtablissement: 'Office Régional de Mise en Valeur Agricole de Ouarzazate',
          sigle: 'ORMVAO',
          tutelle: 'Ministère de l\'Agriculture, de la Pêche Maritime, du Développement Rural et des Eaux et Forêts',
          adresse: 'B.P. 29, Avenue Mohammed V, Ouarzazate, Maroc',
          telephone: '+212 (0) 524 88 24 31 / 32',
          fax: '+212 (0) 524 88 24 33',
          email: 'contact@ormvao.ma',
          siteWeb: 'www.ormvao.ma',
          prixCarburantLitreDh: 13.00,
        }),
      },
      {
        key: 'gps_provider',
        value: JSON.stringify({
          providerName: 'Connecteur Télématique ORMVAO (Multi-Protocol REST / Webhooks)',
          status: 'Actif (Mode Simulateur Certifié & Connecteur REST prêt)',
          endpoint: 'https://telematics.ormvao.gov.ma/api/v2/telemetry',
          syncFrequencySeconds: 30,
          apiKeyConfigured: true,
        }),
      },
    ]);

    // 7. Audit log initial
    await db.insert(auditLogs).values([
      {
        action: 'INITIALISATION',
        entite: 'SYSTEME',
        entiteId: 'ORMVAO-SYS',
        utilisateur: 'Administrateur Système',
        details: 'Initialisation de la base de données PostgreSQL de l\'ORMVAO avec succès.',
      },
    ]);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
  }
}
