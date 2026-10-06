import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fallbackDbPath = path.join(__dirname, '..', 'database.json');
const configuredDbPath = process.env.DB_FILE_PATH || process.env.SQLITE_DB_PATH || fallbackDbPath;
const dbFilePath = configuredDbPath.toLowerCase().endsWith('.sqlite') || configuredDbPath.toLowerCase().endsWith('.db')
  ? fallbackDbPath
  : path.resolve(configuredDbPath);

if (dbFilePath.includes(path.sep)) {
  const dbDirectory = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }
}

// In-memory data store with file persistence
let store = {
  users: [],
  inspections: [],
  nextUserId: 1,
  nextInspectionId: 1
};

// Load existing data from file if present
function loadStore() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      store.users = parsed.users || [];
      store.inspections = parsed.inspections || [];
      store.nextUserId = parsed.nextUserId || (store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1);
      store.nextInspectionId = parsed.nextInspectionId || (store.inspections.length ? Math.max(...store.inspections.map(i => i.id)) + 1 : 1);
      console.log(`✅ Loaded database store from ${dbFilePath} (${store.users.length} users, ${store.inspections.length} inspections)`);
    } else {
      saveStore();
      console.log(`✅ Initialized new database store at ${dbFilePath}`);
    }
  } catch (err) {
    console.error('Database load warning:', err.message);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database persist warning:', err.message);
  }
}

function ensureSeedUsers() {
  const seedUsers = [
    {
      name: 'Inspector Jane Doe',
      email: 'jane.doe@qualisight.ai',
      password: 'SecurePassword123',
      role: 'lead_inspector'
    },
    {
      name: 'Lead QC Auditor',
      email: 'judge.inspector@qualisight.ai',
      password: 'Password@123',
      role: 'lead_inspector'
    }
  ];

  let changed = false;

  for (const seed of seedUsers) {
    const existing = store.users.find((user) => user.email.toLowerCase() === seed.email.toLowerCase());

    if (!existing) {
      store.users.push({
        id: store.nextUserId++,
        name: seed.name,
        email: seed.email.toLowerCase(),
        password: bcrypt.hashSync(seed.password, 10),
        role: seed.role,
        created_at: new Date().toISOString()
      });
      changed = true;
      continue;
    }

    const passwordMatches = bcrypt.compareSync(seed.password, existing.password);
    if (!passwordMatches) {
      existing.password = bcrypt.hashSync(seed.password, 10);
      existing.role = existing.role || seed.role;
      changed = true;
    }
  }

  if (changed) {
    saveStore();
  }
}

loadStore();
ensureSeedUsers();

export const query = {
  run: async (sql, params = []) => {
    const s = sql.trim().toUpperCase();

    // 1. INSERT INTO users
    if (s.startsWith('INSERT INTO USERS')) {
      const [name, email, password, role] = params;
      const user = {
        id: store.nextUserId++,
        name,
        email: email.toLowerCase().trim(),
        password,
        role: role || 'inspector',
        created_at: new Date().toISOString()
      };
      store.users.push(user);
      saveStore();
      return { lastID: user.id, changes: 1 };
    }

    // 2. INSERT INTO inspections
    if (s.startsWith('INSERT INTO INSPECTIONS')) {
      const [user_id, title, category, image_url, status, anomaly_detected, confidence, summary, detected_items, recommendations] = params;
      const inspection = {
        id: store.nextInspectionId++,
        user_id: Number(user_id),
        title,
        category: category || 'Industrial Quality',
        image_url,
        status,
        anomaly_detected: Number(anomaly_detected),
        confidence: Number(confidence),
        summary,
        detected_items,
        recommendations,
        created_at: new Date().toISOString()
      };
      store.inspections.push(inspection);
      saveStore();
      return { lastID: inspection.id, changes: 1 };
    }

    // 3. DELETE FROM inspections
    if (s.startsWith('DELETE FROM INSPECTIONS')) {
      const [id, user_id] = params;
      const prevLen = store.inspections.length;
      store.inspections = store.inspections.filter(i => !(i.id === Number(id) && i.user_id === Number(user_id)));
      saveStore();
      return { changes: prevLen - store.inspections.length };
    }

    return { lastID: 0, changes: 0 };
  },

  get: async (sql, params = []) => {
    const s = sql.trim().toUpperCase();

    // SELECT * FROM users WHERE email = ?
    if (s.includes('FROM USERS') && s.includes('EMAIL = ?')) {
      const email = String(params[0]).toLowerCase().trim();
      const user = store.users.find(u => u.email === email);
      return user ? { ...user } : null;
    }

    // SELECT * FROM users WHERE id = ?
    if (s.includes('FROM USERS') && s.includes('ID = ?')) {
      const id = Number(params[0]);
      const user = store.users.find(u => u.id === id);
      return user ? { ...user } : null;
    }

    // Analytics summary: SELECT COUNT(*) as total_inspections...
    if (s.includes('COUNT(*)')) {
      const userId = Number(params[0]);
      const userInspections = store.inspections.filter(i => i.user_id === userId);
      const total = userInspections.length;
      const passCount = userInspections.filter(i => i.status === 'PASS').length;
      const warningCount = userInspections.filter(i => i.status === 'WARNING').length;
      const failCount = userInspections.filter(i => i.status === 'FAIL').length;
      const totalAnomalies = userInspections.filter(i => i.anomaly_detected === 1).length;
      const sumConf = userInspections.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
      const avgConfidence = total > 0 ? (sumConf / total) : 95.0;

      return {
        total_inspections: total,
        pass_count: passCount,
        warning_count: warningCount,
        fail_count: failCount,
        total_anomalies: totalAnomalies,
        avg_confidence: avgConfidence
      };
    }

    // SELECT * FROM inspections WHERE id = ? AND user_id = ?
    if (s.includes('FROM INSPECTIONS') && s.includes('WHERE ID = ? AND USER_ID = ?')) {
      const [id, user_id] = params;
      const ins = store.inspections.find(i => i.id === Number(id) && i.user_id === Number(user_id));
      return ins ? { ...ins } : null;
    }

    return null;
  },

  all: async (sql, params = []) => {
    const s = sql.trim().toUpperCase();

    if (s.includes('FROM INSPECTIONS')) {
      const userId = Number(params[0]);
      let results = store.inspections.filter(i => i.user_id === userId);

      // Check for status filter
      if (params.length > 1) {
        for (let i = 1; i < params.length; i++) {
          const p = String(params[i]);
          if (['PASS', 'WARNING', 'FAIL'].includes(p)) {
            results = results.filter(item => item.status === p);
          } else if (p.startsWith('%') && p.endsWith('%')) {
            const term = p.slice(1, -1).toLowerCase();
            results = results.filter(item => 
              (item.title && item.title.toLowerCase().includes(term)) ||
              (item.summary && item.summary.toLowerCase().includes(term))
            );
          } else if (['Industrial Quality', 'Hardware & Assembly', 'Workplace Safety & PPE', 'Document & Label Verification', 'General Anomaly Detection'].includes(p)) {
            results = results.filter(item => item.category === p);
          }
        }
      }

      // Sort DESC
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (s.includes('LIMIT 5')) {
        results = results.slice(0, 5);
      }

      return results.map(r => ({ ...r }));
    }

    return [];
  }
};

export default query;
