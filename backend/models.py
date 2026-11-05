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