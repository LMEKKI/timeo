# 🗄️ Data Model — Types & Schemas

> **Règle** : Toutes les tables DB et colonnes utilisent l'anglais et le SINGULIER.
> **Clé primaire** : UUIDv7 partout.
> **Implémentation** : Les types sont dans `shared/src/types/`, les schemas Zod dans `shared/src/schemas/`, le mapping Drizzle dans `server/src/db/schema/`.

---

## Structure des Fichiers

```
shared/src/
├── types/
│   ├── company.ts          # Company, Branch
│   ├── user.ts             # UserProfile, Permission, UserSetting
│   ├── customer.ts         # Customer
│   ├── job.ts              # Job, JobAssignment, JobStatus enum
│   ├── material.ts         # ConsumedMaterial
│   ├── form.ts             # FormTemplate
│   ├── audit.ts            # JobAuditLog, JobBillingSnapshot
│   └── config.ts           # CompanyConfig, SystemConfig, WorkflowConfig
│
├── schemas/
│   ├── company.ts          # Zod schemas pour company + branch
│   ├── user.ts             # Zod schemas pour user + permission
│   ├── job.ts              # Zod schemas pour job + status transitions
│   ├── audit.ts            # Zod schemas pour audit log
│   └── form.ts             # Zod schemas pour form template
│
├── interfaces/
│   ├── job-repository.ts   # IJobRepository (port)
│   ├── user-repository.ts  # IUserRepository (port)
│   ├── auth-provider.ts    # IAuthProvider (port)
│   └── storage-provider.ts # IStorageProvider (port)
│
└── constants/
    └── job-status.ts       # JobStatus enum + transitions autorisées
```

---

## 1. Tenancy & Users

### company
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `name` | string | |
| `created_at` | timestamp | |

### branch
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `company_id` | UUIDv7 (FK → company) | |
| `name` | string | |
| `latitude` | float | |
| `longitude` | float | |
| `created_at` | timestamp | |

### user_profile
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `auth_provider_id` | string (UNIQUE) | ID chez l'auth provider (Better Auth, Clerk...) |
| `branch_id` | UUIDv7 (FK → branch) | |
| `first_name` | string | |
| `last_name` | string | |
| `email` | string (UNIQUE) | |
| `is_deleted` | boolean | Soft delete |

### permission
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `user_profile_id` | UUIDv7 (FK → user_profile) | |
| `role` | enum | GLOBAL_ADMIN, BRANCH_MANAGER, FIELD_TECHNICIAN |

### user_setting
| Champ | Type | Notes |
|---|---|---|
| `user_profile_id` | UUIDv7 (PK/FK → user_profile) | |
| `push_notification_token` | string? | |
| `last_login_at` | timestamp? | |
| `settings` | JSONB | Préférences utilisateur |

### customer
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `branch_id` | UUIDv7 (FK → branch) | |
| `name` | string | |
| `billing_address` | string | |
| `is_deleted` | boolean | Soft delete |

---

## 2. Configuration

### job_type
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `company_id` | UUIDv7 (FK → company) | |
| `name` | string | |
| `estimated_duration_minutes` | int | |

### form_template
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `job_type_id` | UUIDv7 (FK → job_type) | |
| `version` | int | |
| `title` | string | |
| `question_schema` | JSONB | Schema Zod stocké pour validation dynamique |
| `is_active` | boolean | |

### workflow_config
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `job_type_id` | UUIDv7 (FK → job_type) | |
| `engine_type` | string | |
| `approval_required` | boolean | |

### company_config
| Champ | Type | Notes |
|---|---|---|
| `company_id` | UUIDv7 (PK/FK → company) | |
| `settings` | JSONB | `{ gps_threshold_meters, snapshot_retention_years }` |

### system_config
| Champ | Type | Notes |
|---|---|---|
| `id` | int (PK) | Singleton |
| `min_required_app_version` | string | |
| `is_maintenance_active` | boolean | |

---

## 3. Operations & Audit

### job
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `branch_id` | UUIDv7 (FK → branch) | |
| `job_type_id` | UUIDv7 (FK → job_type) | |
| `form_template_id` | UUIDv7 (FK → form_template) | |
| `customer_id` | UUIDv7 (FK → customer) | |
| `status` | JobStatus (enum) | Voir WORKFLOW.md pour les transitions |
| `version` | int | Optimistic locking |
| `scheduled_start_at` | timestamp | |
| `created_at` | timestamp | |

### job_assignment
| Champ | Type | Notes |
|---|---|---|
| `job_id` | UUIDv7 (FK → job) | Composite PK |
| `user_profile_id` | UUIDv7 (FK → user_profile) | Composite PK |
| `is_primary` | boolean | Un seul primary par job |

### consumed_material
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `job_id` | UUIDv7 (FK → job) | |
| `item_name` | string | |
| `quantity` | int | |
| `internal_reference` | string | |

### job_audit_log
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `job_id` | UUIDv7 (FK → job) | |
| `user_profile_id` | UUIDv7 (FK → user_profile) | |
| `previous_status` | JobStatus | |
| `new_status` | JobStatus | |
| `comment_reason` | string? | Requis pour les transitions CANCELLED/REJECTED |
| `created_at` | timestamp | |

### job_billing_snapshot
| Champ | Type | Notes |
|---|---|---|
| `id` | UUIDv7 (PK) | |
| `job_id` | UUIDv7 (UNIQUE FK → job) | Pris au moment du COMPLETED |
| `historical_customer_name` | string | Gelé au moment du snapshot |
| `historical_address_raw` | string | Gelé au moment du snapshot |
| `historical_form_responses` | JSONB | Gelé au moment du snapshot |
| `customer_signature_hash` | string | Hash de la signature |
| `sealed_at` | timestamp | |

---

## 4. Relations (Résumé)

```
company 1──N branch
company 1──N job_type
branch  1──N user_profile
branch  1──N customer
branch  1──N job
user_profile 1──1 user_setting
user_profile 1──N permission
user_profile N──M job          (via job_assignment)
job_type  1──N form_template
job_type  1──1 workflow_config
job       1──N consumed_material
job       1──N job_audit_log
job       1──1 job_billing_snapshot
```