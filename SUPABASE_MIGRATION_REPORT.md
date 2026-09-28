# RAJA ELECTRICALS — SUPABASE MIGRATION REPORT

## Executive Summary
- **Source Supabase Host**: `yfbzapzceoqkwzsmsjmk.supabase.co`
- **Source Direct DB Host**: `aws-0-ap-southeast-1.pooler.supabase.com:6543` (PostgreSQL 17.6)
- **Source S3 Endpoint**: `https://yfbzapzceoqkwzsmsjmk.storage.supabase.co/storage/v1/s3`
- **Destination Supabase Host**: `ueohqicjodxwkwdxcrnj.supabase.co`
- **Timestamp**: 2026-09-28T11:28:00+05:30
- **Destination Schema Status**: **READY — IDEMPOTENT**
- **Database Migration Status**: **SUCCESSFUL / VALIDATED (280/280 Records)**
- **Destination Bucket Status**: **RAJA_ELE CREATED & PUBLIC**
- **Storage Manifest**: **67 UNIQUE OBJECTS / 133 REFERENCES MAPPED**
- **Section I Source S3 Recovery Test**: **BLOCKED BY EGRESS QUOTA (HTTP 402)**

---

## 1. Table Record Count Comparison

| Table | Source | Destination | Difference | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| `products` | 189 | 189 | 0 | **VERIFIED ✓** |
| `brands` | 51 | 51 | 0 | **VERIFIED ✓** |
| `categories` | 30 | 30 | 0 | **VERIFIED ✓** |
| `gallery` | 7 | 7 | 0 | **VERIFIED ✓** |
| `admins` | 2 | 2 | 0 | **VERIFIED ✓** |
| `site_settings` | 1 | 1 | 0 | **VERIFIED ✓** |
| `catalogues` | 0 | 0 | 0 | **VERIFIED ✓** |
| `enquiries` | 0 | 0 | 0 | **VERIFIED ✓** |
| `industries` | 0 | 0 | 0 | **VERIFIED ✓** |
| `orders` | 0 | 0 | 0 | **VERIFIED ✓** |
| `projects` | 0 | 0 | 0 | **VERIFIED ✓** |
| **TOTAL** | **280** | **280** | **0** | **100% MATCH ✓** |

---

## 2. Storage Migration Pre-Flight Verification

1. **Destination Bucket Creation**: `RAJA_ELE` bucket checked and created on destination Supabase project (`ueohqicjodxwkwdxcrnj`) with public-read permissions.
2. **Canonical Manifest**: Created [storage-migration-manifest.json](file:///d:/raj-electric%20completed%20pg/New%20folder/main%20electric/storage-migration-manifest.json) mapping 133 database references to 67 unique object paths under `RAJA_ELE/products/`.
3. **Resumable State Logging**: Updated [SUPABASE_COMPLETE_MIGRATION_STATE.md](file:///d:/raj-electric%20completed%20pg/New%20folder/main%20electric/SUPABASE_COMPLETE_MIGRATION_STATE.md).

---

## 3. Section I — Source S3 Single Object Recovery Test Result

- **Tested Object**: `RAJA_ELE/products/1790278938385-949ui-1790278938385.jpg` (Product ID: `1790278938385-949ui`, `Paint`)
- **S3 Endpoint**: `https://yfbzapzceoqkwzsmsjmk.storage.supabase.co/storage/v1/s3` (`ap-southeast-1`)
- **Client**: `@aws-sdk/client-s3` (`HeadObjectCommand` / `GetObjectCommand`)
- **HTTP Status Returned**: **`402 Payment Required`**
- **Error Code**: `exceed_egress_quota`

### Directive Compliance
As instructed by the critical decision gate:
```text
SOURCE_S3_ACCESS_BLOCKED_BY_EGRESS_QUOTA
```
- Migration was **STOPPED IMMEDIATELY**.
- Zero files were repeatedly retried.
- Zero destination database records or image URLs were altered.
- Production configuration was NOT modified.

