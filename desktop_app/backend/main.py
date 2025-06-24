from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
from pathlib import Path
import json
import os
from typing import Dict, List, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent.parent  # fabric-UI root
PATTERNS_DIR = ROOT_DIR / "patterns"
CONFIG_FILE = ROOT_DIR / "desktop_app" / "config.json"
HISTORY_FILE = ROOT_DIR / "desktop_app" / "history.json"
LOGS_DIR = ROOT_DIR / "desktop_app" / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Fabric Desktop Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_patterns() -> List[str]:
    if not PATTERNS_DIR.exists():
        return []
    return sorted([p.name for p in PATTERNS_DIR.iterdir() if p.is_dir()])


def _read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def _load_config() -> Dict[str, str]:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def _save_config(cfg: Dict[str, str]):
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2))


def _append_history(record: Dict):
    history: List[Dict] = []
    if HISTORY_FILE.exists():
        history = json.loads(HISTORY_FILE.read_text())
    history.append(record)
    HISTORY_FILE.write_text(json.dumps(history, indent=2))


class Pattern(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    user_prompt: Optional[str] = None


class RunRequest(BaseModel):
    pattern: str
    parameters: Dict[str, str] = {}
    chain: Optional[List['RunRequest']] = None  # for compounding patterns


class ConfigItem(BaseModel):
    key: str
    value: str


@app.get("/patterns", response_model=List[Pattern])
async def list_patterns():
    items = []
    for name in _load_patterns():
        p_dir = PATTERNS_DIR / name
        desc_src = p_dir / "README.md"
        desc = _read_file(desc_src) if desc_src.exists() else _read_file(p_dir / "system.md").split("\n")[0]
        items.append(Pattern(name=name, description=desc))
    return items


@app.get("/patterns/{pattern_name}", response_model=Pattern)
async def get_pattern(pattern_name: str):
    p_dir = PATTERNS_DIR / pattern_name
    if not p_dir.exists():
        raise HTTPException(404, "Pattern not found")
    return Pattern(
        name=pattern_name,
        description=_read_file(p_dir / "README.md"),
        system_prompt=_read_file(p_dir / "system.md"),
        user_prompt=_read_file(p_dir / "user.md"),
    )


def _run_pattern(pattern: str, parameters: Dict[str, str], job_id: str):
    log_file = LOGS_DIR / f"{job_id}.log"
    with log_file.open("w", encoding="utf-8") as f:
        f.write(f"Running pattern {pattern} with params {parameters}\n")
        f.flush()
        # Placeholder: simulate pattern execution
        import time
        for i in range(3):
            time.sleep(1)
            f.write(f"Step {i+1} complete\n")
            f.flush()
        f.write("Done.\n")
        f.flush()
    _append_history({"job_id": job_id, "pattern": pattern, "parameters": parameters})


@app.post("/run")
async def run_pattern(req: RunRequest, background_tasks: BackgroundTasks):
    if req.pattern not in _load_patterns():
        raise HTTPException(400, "Unknown pattern")
    job_id = str(uuid4())
    background_tasks.add_task(_run_pattern, req.pattern, req.parameters, job_id)
    return {"job_id": job_id}


@app.get("/logs/{job_id}")
async def get_logs(job_id: str):
    log_file = LOGS_DIR / f"{job_id}.log"
    if not log_file.exists():
        raise HTTPException(404, "Job not found")
    return {"content": _read_file(log_file)}


@app.get("/history")
async def history():
    if not HISTORY_FILE.exists():
        return []
    return json.loads(HISTORY_FILE.read_text())


@app.get("/config")
async def get_config():
    return _load_config()


@app.post("/config")
async def set_config(item: ConfigItem):
    cfg = _load_config()
    cfg[item.key] = item.value
    _save_config(cfg)
    return cfg
