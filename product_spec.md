# OpenClaw Monitoring Dashboard Spec

## 0. What the app does
A no‑auth monitoring dashboard that lets users generate a unique API key, track tasks via a lightweight SDK, and view live activity feeds and statistics. The key is used client‑side to send events to the backend, which aggregates and renders real‑time dashboards.

## 1. Features
- One‑click API key generation with a copy button.
- Random key format: `claw_abc123def456`.
- Track endpoint (`POST /api/track`) for task duration, success flag, and timestamp.
- Live activity feed in the dashboard (real‑time events).
- Simple charts: success rate, tasks per hour.
- Stats cards: total tasks, overall success rate.
- Integration guide with copy‑paste JavaScript SDK snippet.
- Mobile‑responsive UI layout.
- Real‑time updates (polling/SSE).

## 2. File Structure
backend/
  app.py
  config.py
  models.py
  requirements.txt
frontend/
  index.html
  src/
    main.jsx
    App.jsx
    components/
      Dashboard.jsx
      Home.jsx
      KeyGenerator.jsx
      IntegrationGuide.jsx
    services/
      api.js
    utils/
      format.js
    package.json
.env
.gitignore
README.md
migrations/
  __init__.py

## 3. Database Schema
* **Keys**: `id` (PK, Integer), `key` (String, unique), `created_at` (DateTime)
* **TrackEvents**: `id` (PK, Integer), `key_id` (FK → Keys.id), `task` (String), `duration` (Integer), `success` (Boolean), `timestamp` (DateTime)

## 4. API Contract
* **POST /api/keys**
  - Purpose: Generate a new monitoring key.
  - Request: none
  - Response: `{ key: "claw_abc123def456" }`

* **POST /api/track**
  - Purpose: Record a monitoring event.
  - Request: `key`, `task`, `duration`, `success`, `timestamp`
  - Response: `{ id, key, task, duration, success, timestamp }`

* **GET /api/dashboard/:key**
  - Purpose: Retrieve recent events and aggregated stats for a key.
  - Response: `{ recent_events: [...], stats: { total_tasks, success_rate, tasks_per_hour } }`

## 5. Implementation Details

**🔍 TECHNICAL RESEARCH & VERIFIED INTEGRATIONS (from Research Agent):**
- Exa.ai MCP endpoint returns 405 Method Not Allowed; verify that the integration uses POST for `/mcp` and includes required `exaApiKey` header.
- If additional search or data enrichment is needed, the Exa API can be leveraged for dynamic integration documentation.

**Recommended APIs, MCPs, and Libraries:**
- Flask (web framework)
- Flask‑SQLAlchemy (ORM)
- python‑dotenv (environment variables)
- React (frontend)
- Vite (frontend build tool)
- Chart.js (simple charting)
- axios (client HTTP library for frontend)

**Environment Setup:**
- **Node.js >=18**, npm/yarn. Run `cd frontend && npm install` to install React+Vite dependencies.
- **Python >=3.10** with virtual environment. Install backend packages: `pip install Flask Flask-SQLAlchemy python-dotenv`.
- Set `DATABASE_URL=sqlite:///instance/openclaw.db` in `.env`. Ensure the `instance/` folder exists for SQLite files.
- Start backend with `python backend/app.py` (listens on port 5000).
- Start frontend with `npm run dev` (default Vite port 5000). Backend and frontend share the same port via Flask's `app.run(port=5000)`.

**Code Boilerplate:**

- **config.py**
```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
```

- **models.py**
```python
from config import db
from datetime import datetime

class Keys(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(32), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TrackEvents(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key_id = db.Column(db.Integer, db.ForeignKey('keys.id'), nullable=False)
    task = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    success = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    key = db.relationship('Keys', backref='events')
```

- **app.py** (excerpt)
```python
from flask import Flask, request, jsonify
from config import db, app as flask_app
from models import Keys, TrackEvents
import secrets
import string

# Import routes or define inline
@flask_app.route('/api/keys', methods=['POST'])
def generate_key():
    alphabet = string.ascii_lowercase + string.digits
    key = 'claw_' + ''.join(secrets.choice(alphabet) for _ in range(16))
    new_key = Keys(key=key)
    db.session.add(new_key)
    db.session.commit()
    return jsonify({'key': key})

@flask_app.route('/api/track', methods=['POST'])
def track():
    data = request.get_json()
    key_obj = Keys.query.filter_by(key=data['key']).first()
    if not key_obj:
        return jsonify({'error': 'Invalid key'}), 400
    event = TrackEvents(
        key_id=key_obj.id,
        task=data['task'],
        duration=data['duration'],
        success=data['success'],
        timestamp=data.get('timestamp')
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({
        'id': event.id,
        'key': data['key'],
        'task': event.task,
        'duration': event.duration,
        'success': event.success,
        'timestamp': event.timestamp.isoformat()
    })

@flask_app.route('/api/dashboard/<key>', methods=['GET'])
def dashboard(key):
    key_obj = Keys.query.filter_by(key=key).first()
    if not key_obj:
        return jsonify({'error': 'Key not found'}), 404
    events = TrackEvents.query.filter_by(key_id=key_obj.id).order_by(TrackEvents.timestamp.desc()).limit(20).all()
    total = len(events)
    success = sum(1 for e in events if e.success)
    success_rate = (success / total * 100) if total else 0

    # Simple tasks per hour calculation (approx)
    if events:
        first = events[-1].timestamp
        last = events[0].timestamp
        hours = max((last - first).total_seconds() / 3600, 1)
        tasks_per_hour = total / hours
    else:
        tasks_per_hour = 0

    recent = [{
        'task': e.task,
        'duration': e.duration,
        'success': e.success,
        'timestamp': e.timestamp.isoformat()
    } for e in events]

    return jsonify({
        'recent_events': recent,
        'stats': {
            'total_tasks': total,
            'success_rate': round(success_rate, 2),
            'tasks_per_hour': round(tasks_per_hour, 2)
        }
    })

if __name__ == '__main__':
    with flask_app.app_context():
        db.create_all()
    flask_app.run(host='0.0.0.0', port=5000)
```

- **frontend/services/api.js**
```javascript
export const generateKey = () => fetch('/api/keys', { method: 'POST' }).then(r => r.json());
export const trackEvent = (payload) => fetch('/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(r => r.json());
export const getDashboard = (key) => fetch(`/api/dashboard/${key}`).then(r => r.json());
```

- **frontend/src/components/KeyGenerator.jsx** (UI snippet)
```jsx
import React, { useState } from 'react';
import { generateKey } from '../services/api';

export default function KeyGenerator() {
  const [key, setKey] = useState('');
  const handleGenerate = async () => {
    const resp = await generateKey();
    setKey(resp.key);
  };
  const copy = () => navigator.clipboard.writeText(key);
  return (
    <div>
      <button onClick={handleGenerate}>Generate Free Key</button>
      {key && (
        <div>
          <code>{key}</code>
          <button onClick={copy}>Copy</button>
        </div>
      )}
    </div>
  );
}
```

- **frontend/src/components/Dashboard.jsx** (UI snippet)
```jsx
import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { Line } from 'react-chartjs-2';

export default function Dashboard({ key }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await getDashboard(key);
      setData(resp);
    }, 5000);
    return () => clearInterval(interval);
  }, [key]);

  if (!data) return <div>Loading...</div>;

  const chartData = {
    labels: data.recent_events.map(e => new Date(e.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Success Rate',
      data: data.recent_events.map(e => e.success ? 1 : 0),
      borderColor: 'green',
      tension: 0.4
    }]
  };

  return (
    <div>
      <h2>Dashboard for {key}</h2>
      <div>Total Tasks: {data.stats.total_tasks}</div>
      <div>Success Rate: {data.stats.success_rate}%</div>
      <div>Tasks/Hour: {data.stats.tasks_per_hour}</div>
      <Line data={chartData} />
      <ul>
        {data.recent_events.map((e, i) => (
          <li key={i}>{e.task} - {e.duration}ms - {e.success ? '✓' : '✗'}</li>
        ))}
      </ul>
    </div>
  );
}
```

- **frontend/src/main.jsx**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- **frontend/index.html** (root of frontend/)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenClaw Monitoring</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

All components follow the no‑auth approach, use plain JavaScript (.jsx), and integrate with the defined Flask backend endpoints.
