import os
import secrets
import string
from datetime import datetime
from flask import request, jsonify
from config import db, app as flask_app
from models import Keys, TrackEvents


def parse_timestamp(ts_str):
    """Parse ISO timestamp, handling 'Z' suffix."""
    if not ts_str:
        return datetime.utcnow()
    if ts_str.endswith('Z'):
        ts_str = ts_str[:-1] + '+00:00'
    return datetime.fromisoformat(ts_str)


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
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400
    key_str = data.get('key')
    if not key_str:
        return jsonify({'error': 'Missing key'}), 400
    key_obj = Keys.query.filter_by(key=key_str).first()
    if not key_obj:
        return jsonify({'error': 'Invalid key'}), 400
    task = data.get('task')
    duration = data.get('duration')
    success = data.get('success')
    timestamp_str = data.get('timestamp')
    if not task or duration is None or success is None:
        return jsonify({'error': 'Missing required fields'}), 400
    timestamp = parse_timestamp(timestamp_str)
    event = TrackEvents(
        key_id=key_obj.id,
        task=task,
        duration=duration,
        success=success,
        timestamp=timestamp
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({
        'id': event.id,
        'key': key_str,
        'task': event.task,
        'duration': event.duration,
        'success': event.success,
        'timestamp': event.timestamp.isoformat() + 'Z'
    })


@flask_app.route('/api/dashboard/<key>', methods=['GET'])
def dashboard(key):
    key_obj = Keys.query.filter_by(key=key).first()
    if not key_obj:
        return jsonify({'error': 'Key not found'}), 404

    # Stats from all events
    all_events = TrackEvents.query.filter_by(key_id=key_obj.id).all()
    total_tasks = len(all_events)
    if total_tasks > 0:
        success_count = sum(1 for e in all_events if e.success)
        success_rate = (success_count / total_tasks) * 100
        first_ts = min(e.timestamp for e in all_events)
        last_ts = max(e.timestamp for e in all_events)
        hours = max((last_ts - first_ts).total_seconds() / 3600, 1)
        tasks_per_hour = total_tasks / hours
    else:
        success_rate = 0
        tasks_per_hour = 0

    # Recent events (last 20)
    recent_events = TrackEvents.query.filter_by(key_id=key_obj.id).order_by(TrackEvents.timestamp.desc()).limit(20).all()
    recent = [{
        'task': e.task,
        'duration': e.duration,
        'success': e.success,
        'timestamp': e.timestamp.isoformat() + 'Z'
    } for e in recent_events]

    return jsonify({
        'recent_events': recent,
        'stats': {
            'total_tasks': total_tasks,
            'success_rate': round(success_rate, 2),
            'tasks_per_hour': round(tasks_per_hour, 2)
        }
    })


if __name__ == '__main__':
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    with flask_app.app_context():
        db.create_all()
    flask_app.run(host='0.0.0.0', port=5000)