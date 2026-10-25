
import { useEffect,useState } from "react";
import "./App.css";
import { checkBackendHealth, analyzeLogs } from "./api";

const initialEvents = [
  {
    id: 1,
    time: "10:02:14",
    ip: "192.0.2.10",
    user: "demo_user",
    event: "Repeated failed logins",
    severity: "High",
    status: "Investigating",
  },
  {
    id: 2,
    time: "10:01:42",
    ip: "192.0.2.20",
    user: "test_user",
    event: "Successful login",
    severity: "Low",
    status: "Normal",
  },
  {
    id: 3,
    time: "09:58:06",
    ip: "192.0.2.30",
    user: "admin_demo",
    event: "Unusual login pattern",
    severity: "Medium",
    status: "Review",
  },
  {
    id: 4,
    time: "09:45:31",
    ip: "192.0.2.40",
    user: "analyst_demo",
    event: "Password authentication",
    severity: "Low",
    status: "Normal",
  },
];

function App() {

  const [backendStatus, setBackendStatus] = useState("Checking...");

useEffect(() => {
  checkBackendHealth()
    .then(() => setBackendStatus("Connected"))
    .catch(() => setBackendStatus("Disconnected"));
}, []);

  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState(initialEvents);

  const filteredEvents = events.filter((event) =>
    `${event.ip} ${event.user} ${event.event} ${event.severity}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

useEffect(() => {
  checkBackendHealth()
    .then(() => setBackendStatus("Connected"))
    .catch(() => setBackendStatus("Disconnected"));
}, []);

  const highAlerts = events.filter(
    (event) => event.severity === "High"
  ).length;

  function resolveAlert(id) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? { ...event, status: "Reviewed" }
          : event
      )
    );
  }

const [analysis, setAnalysis] = useState(null);
const [analysisLoading, setAnalysisLoading] = useState(false);
const [analysisError, setAnalysisError] = useState("");

async function handleAnalyzeLogs() {
  setAnalysisLoading(true);
  setAnalysisError("");

  const sampleLogs = [
    {
      timestamp: "2026-10-22T10:00:00",
      source_ip: "192.0.2.10",
      username: "testuser",
      event_type: "login",
      status: "failed",
    },
    {
      timestamp: "2026-10-22T10:01:00",
      source_ip: "192.0.2.10",
      username: "testuser",
      event_type: "login",
      status: "failed",
    },
    {
      timestamp: "2026-10-22T10:02:00",
      source_ip: "192.0.2.10",
      username: "testuser",
      event_type: "login",
      status: "failed",
    },
    {
      timestamp: "2026-10-22T10:03:00",
      source_ip: "192.0.2.20",
      username: "demo_user",
      event_type: "login",
      status: "success",
    },
  ];

  try {
    const result = await analyzeLogs(sampleLogs);
    setAnalysis(result);
  } catch (error) {
    setAnalysisError(error.message || "Could not analyze logs.");
  } finally {
    setAnalysisLoading(false);
  }
}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SecureWatch</h2>
            <span>SECURITY CENTER</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        {[
          ["Overview", "◫"],
          ["Threat Alerts", "⚑"],
          ["Security Events", "◷"],
          ["Reports", "▤"],
        ].map(([name, icon]) => (
          <button
            key={name}
            className={`nav-item ${
              activePage === name ? "active" : ""
            }`}
            onClick={() => setActivePage(name)}
          >
            <span>{icon}</span>
            {name}
            {name === "Threat Alerts" && highAlerts > 0 && (
              <span className="nav-count">{highAlerts}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>System Online</strong>
              <small>Local demo environment</small>
            </div>
          </div>
          <p>SECUREWATCH v1.0.0</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activePage}</p>
            <h1>{activePage}</h1>
          </div>
          <div className="topbar-right">
            <span className="environment">
              <span className="status-dot" />
              DEMO MODE
            </span>
            <div className="avatar">SW</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">SECURITY OPERATIONS</p>
            <h2>Your security at a glance.</h2>
            <p>
              Monitor sample events and review suspicious login
              activity from one dashboard.
            </p>
            <p>Backend status: {backendStatus}</p>
          </div>
          <div className="shield-art" aria-hidden="true">
            ◈
          </div>
        </section>
        
<section className="analysis-panel">
  <h2>Security Log Analysis</h2>

  <button
    onClick={handleAnalyzeLogs}
    disabled={analysisLoading}
  >
    {analysisLoading ? "Analyzing..." : "Analyze Sample Logs"}
  </button>

  {analysisError && <p>{analysisError}</p>}

  {analysis && (
    <div>
      <p>Total Events: {analysis.total_events}</p>
      <p>Failed Logins: {analysis.failed_logins}</p>
      <p>Suspicious IPs: {analysis.suspicious_ips}</p>

      <h3>Alerts</h3>
      {analysis.alerts.length === 0 ? (
        <p>No suspicious activity detected.</p>
      ) : (
        analysis.alerts.map((alert) => (
          <p key={alert.source_ip}>
            {alert.source_ip} — {alert.severity.toUpperCase()} —
            {` ${alert.failed_attempts} failed attempts`}
          </p>
        ))
      )}
    </div>
  )}
</section>


        {activePage === "Reports" ? (
          <section className="panel report-panel">
            <div className="section-heading">
              <div>
                <h3>Security Reports</h3>
                <p>Summary of the current sample dataset</p>
              </div>
            </div>
            <div className="report-summary">
              <p>Total sample events: <strong>{events.length}</strong></p>
              <p>High-severity alerts: <strong>{highAlerts}</strong></p>
              <p>Reviewed events: <strong>{events.filter((e) => e.status === "Reviewed").length}</strong></p>
            </div>
            <p className="muted">
              These figures are based on demonstration data, not live
              security monitoring.
            </p>
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total Events</span>
                  <span className="stat-icon blue">▤</span>
                </div>
                <h3>{events.length}</h3>
                <p>Events in sample dataset</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>High Alerts</span>
                  <span className="stat-icon red">⚑</span>
                </div>
                <h3>{highAlerts}</h3>
                <p>Require further investigation</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Medium Alerts</span>
                  <span className="stat-icon orange">◈</span>
                </div>
                <h3>
                  {events.filter((e) => e.severity === "Medium").length}
                </h3>
                <p>Flagged for review</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Reviewed</span>
                  <span className="stat-icon green">✓</span>
                </div>
                <h3>
                  {events.filter((e) => e.status === "Reviewed").length}
                </h3>
                <p>Events marked reviewed</p>
              </article>
            </section>

            <section className="panel">
              <div className="section-heading">
                <div>
                  <h3>
                    {activePage === "Threat Alerts"
                      ? "Threat Alerts"
                      : activePage === "Security Events"
                      ? "All Security Events"
                      : "Recent Security Events"}
                  </h3>
                  <p>Fictional events for development and testing</p>
                </div>

                <input
                  className="search-input"
                  type="search"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>SOURCE IP</th>
                      <th>USER</th>
                      <th>EVENT</th>
                      <th>SEVERITY</th>
                      <th>STATUS</th>
                      {activePage === "Threat Alerts" && <th>ACTION</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents
                      .filter(
                        (event) =>
                          activePage !== "Threat Alerts" ||
                          event.severity === "High" ||
                          event.severity === "Medium"
                      )
                      .map((event) => (
                        <tr key={event.id}>
                          <td className="time-cell">{event.time}</td>
                          <td>{event.ip}</td>
                          <td>{event.user}</td>
                          <td>{event.event}</td>
                          <td>
                            <span
                              className={`severity ${event.severity.toLowerCase()}`}
                            >
                              {event.severity}
                            </span>
                          </td>
                          <td>
                            <span className="event-status">
                              {event.status}
                            </span>
                          </td>
                          {activePage === "Threat Alerts" && (
                            <td>
                              <button
                                className="review-button"
                                onClick={() => resolveAlert(event.id)}
                                disabled={event.status === "Reviewed"}
                              >
                                {event.status === "Reviewed"
                                  ? "Reviewed"
                                  : "Review"}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    {filteredEvents.filter(
                      (event) =>
                        activePage !== "Threat Alerts" ||
                        event.severity === "High" ||
                        event.severity === "Medium"
                    ).length === 0 && (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          No matching events found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>Sample data · No live monitoring connected</span>
                <span>{filteredEvents.length} matching records</span>
              </div>
            </section>
          </>
        )}

        <footer>
          <span>SecureWatch · Cybersecurity Portfolio Project</span>
          <span>Built with React + Python FastAPI</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
