# RESQ-AI — Bug Fix Changelog

This build resolves all critical and high-priority issues identified in code review. Verified via static analysis (Python syntax check, import-integrity check, and full TypeScript compile with zero errors).

## Critical fixes (backend would not start / core routes crashed)

1. **Fatal ImportError on startup** — `PredictiveRiskRequest` / `PredictiveRiskResponse` were referenced in `routers/zones.py` and `routers/incidents.py` but never defined in `schemas.py`. Added both classes with the correct fields (`zone_id`, `zone_name`, `predictions`, `overall_risk_score`, `risk_factors`).

2. **Zones/Resources tables always empty** — `seed_database()` existed but was never called. Now invoked in `main.py`'s `lifespan()` before the simulation engine starts, so the GIS dashboard, Active Zones panel, and Resource Allocation panel are populated on boot.

3. **`POST /api/incidents/{id}/summary` crashed every call** — response was built with fields that don't exist on `AISummaryResponse` (`original_text`, `tactical_report`, `confidence`) while omitting required fields (`summary`, `keywords`). Fixed to match the schema exactly.

4. **`POST /api/resources` crashed every call** — `resource_id` generation referenced a nonexistent class attribute (`Resource._sa_instance_state`). Replaced with a timestamp-based ID, consistent with the pattern used elsewhere.

5. **`POST /api/resources/{id}/deploy/{incident_id}` crashed every call** — `Incident` model was used but never imported in `routers/resources.py`. Import fixed.

## High-priority fixes (features silently failed)

6. **"Generate SitRep" never reached the real AI backend** — frontend called `/api/summary`, a route that didn't exist, and silently fell back to a fake local template every time. Added a real `POST /api/summary` batch endpoint on the backend (`BatchSummaryRequest` → aggregated SitRep across selected incidents), and the frontend fallback now visibly shows an "offline mode" badge instead of failing silently.

7. **Corrupted mock/demo text** — several Tamil strings had stray English/Hebrew characters mixed in (e.g. `"போரம dictators"`, `"மண்ணlide"`, `"மண்ணillus"`, `"...שבில்..."`), which would have looked broken during a live demo. All replaced with clean Tamil text. Full codebase swept for any remaining mixed-script strings — none found.

8. **Duplicate enum definitions** — `IncidentType`, `PriorityLevel`, etc. were declared twice (once in `models.py`, once in `schemas.py`) as incompatible Python Enum classes. `schemas.py` now imports the canonical enums from `models.py` instead of redeclaring them.

## Cleanup

9. **Hardcoded `localhost` in `next.config.js`** — now reads `BACKEND_URL` from the environment (documented in `Frontend/.env.local.example`), so the app works in non-local deployments.

10. **Unused dependencies removed** — `socket.io-client` and `axios` were listed in `package.json` but never used (the app uses native `WebSocket` and `fetch`). Removed.

## Verification performed
- `python -m py_compile` on every backend `.py` file — passes with zero errors
- Static import-integrity check confirming every `from app.schemas import X` resolves to an actual class — passes
- Full TypeScript compile (`tsc --noEmit`) across the entire frontend — zero errors
- Full-codebase scan for mixed-script (Latin+Tamil/Hindi/Bengali) corrupted strings — zero remaining

## Before running
- Backend: `cd Backend && pip install -r requirements.txt`, set up `.env` from `.env.example`, then `uvicorn app.main:app --reload`
- Frontend: `cd Frontend && npm install`, set up `.env.local` from `.env.local.example`, then `npm run dev`
