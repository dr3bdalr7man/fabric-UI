# Fabric Desktop App

This folder contains a minimal FastAPI backend to expose Fabric patterns for a future React/Electron front-end.

Run locally:

```bash
uvicorn fabric_UI.desktop_app.backend.main:app --host 0.0.0.0 --port 52083 --reload
```

It exposes endpoints:

* `/patterns` – list patterns (name + description)
* `/patterns/{name}` – full pattern metadata
* `/run` – POST body `{pattern: str, parameters: {key: val}}` returns `job_id` and runs in background, logs streamed via `/logs/{job_id}`
* `/history` – previous runs
* `/config` (GET/POST) – manage API keys / env vars used by the CLI

This is **placeholder** logic; `_run_pattern` just writes dummy log entries. Wire it to the real Go CLI later.
