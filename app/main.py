from fastapi.middleware.cors import CORSMiddleware
from collections import Counter, defaultdict

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="SecureWatch API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LogEvent(BaseModel):
    timestamp: str
    source_ip: str
    username: str
    event_type: str
    status: str



class AnalysisRequest(BaseModel):
    logs: list[LogEvent]


@app.get("/")
def home():
    return {
        "message": "Welcome to SecureWatch API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/analyze")
def analyze_logs(request: AnalysisRequest):
    failed_logins = defaultdict(int)

    for log in request.logs:
        if (
            log.event_type.lower() == "login"
            and log.status.lower() == "failed"
        ):
            failed_logins[log.source_ip] += 1

    alerts = []

    for ip, count in failed_logins.items():
        if count >= 3:
            alerts.append({
                "source_ip": ip,
                "failed_attempts": count,
                "severity": "high",
                "message": "Repeated failed login attempts detected",
            })

    event_types = Counter(
        log.event_type for log in request.logs
    )

    return {
        "total_events": len(request.logs),
        "failed_logins": sum(failed_logins.values()),
        "suspicious_ips": len(alerts),
        "event_type_counts": dict(event_types),
        "alerts": alerts,
        "note": (
            "Alerts indicate suspicious patterns, "
            "not confirmed attacks."
        ),
    }
