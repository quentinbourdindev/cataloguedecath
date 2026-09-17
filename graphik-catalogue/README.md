# Graphik — Catalogue Decathlon

Outil métier B2B pour l'agence **Graphik** : générateur de devis interactif côté client + mini-CRM admin pour les relookings des magasins **Decathlon**.

---

## Stack

| Technologie | Usage |
|---|---|
| Next.js 15 (App Router) | Framework full-stack |
| React 19 + TypeScript | UI |
| Tailwind CSS v4 | Styles |
| GSAP | Animations |
| Shadcn/UI + Lucide | Composants |
| Prisma v6 + PostgreSQL | Base de données |
| MinIO | Stockage fichiers (S3-compatible) |
| NextAuth.js v5 | Auth Magic Link |
| Resend | Emails transactionnels |
| React Hook Form + Zod | Formulaires & validation |

---

## Démarrage rapide

### 1. Prérequis
- Node.js ≥ 18, Docker & Docker Compose
- Un compte [Resend](https://resend.com) (gratuit — 3 000 emails/mois)

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Remplissez `.env` avec :
- `AUTH_SECRET` — générez avec `openssl rand -base64 32`
- `RESEND_API_KEY` — votre clé API Resend
- `RESEND_FROM` — votre email expéditeur vérifié sur Resend

### 3. Services Docker

```bash
docker compose up -d
```

Lance : **PostgreSQL** (`localhost:5432`) + **MinIO** (`localhost:9000` API / `localhost:9001` console).

**Console MinIO** : http://localhost:9001 → Login : `graphik_minio` / `graphik_minio_secret_2025`

> ⚠️ Créer le bucket `graphik-plans` dans la console MinIO, ou via CLI :
> ```bash
> docker exec graphik_minio mc alias set local http://localhost:9000 graphik_minio graphik_minio_secret_2025
> docker exec graphik_minio mc mb local/graphik-plans
> docker exec graphik_minio mc anonymous set download local/graphik-plans
> ```

### 4. Base de données

```bash
npm run db:push   # Créer les tables
npm run db:seed   # Peupler avec données de démo
```

**Comptes créés par le seed :**
| Email | Rôle |
|---|---|
| `remy.haller@graphik.fr` | ADMIN |
| `franck.bellamy@graphik.fr` | COMMERCIAL |
| `directeur@decathlon-nancy.fr` | CLIENT |

### 5. Lancer l'app

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

> 💡 **Magic Links en dev** : les liens s'affichent dans la **console terminal** (pas d'email envoyé).

---

## Routes

```
/login                  Connexion Magic Link
/catalogue              Catalogue client + panier (autosave)
/devis                  Tunnel 4 étapes : Récap → Contact → Logistique → Upload

/admin/dashboard        Dashboard KPIs
/admin/briefs           Pipeline briefs filtrable
/admin/briefs/[id]      Éditeur de brief (prix, quantités, hors-catalogue)
/admin/produits         CRUD catalogue produits
/admin/stores           Mini-CRM (magasins + utilisateurs)
```

## Workflow

```
CLIENT                          ADMIN (Graphik)
  │                                    │
  ├─ Magic Link → connecté             │
  ├─ Catalogue → panier (autosave)     │
  ├─ Stepper 4 étapes                  │
  ├─ Soumet → SUBMITTED                │
  │  Email → ─────────────────────────►│
  │                                    ├─ Modifie prix / ajoute lignes
  │                                    ├─ Valide → VALIDATED ──► Email client
  │                                    └─ ou Renvoie → REVIEWING ──► Email client
  ├─ (si REVIEWING) Modifie + resoumet │
  └─────────────────────────────────── ►│
```

## Commandes utiles

```bash
npm run dev          # Dev mode
npm run build        # Build production
npm run db:studio    # Interface Prisma Studio
npm run db:migrate   # Nouvelle migration
docker compose up -d # Démarrer PostgreSQL + MinIO
docker compose down  # Arrêter
```
