from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class InteractionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

class DeviceDetail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_agent = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    screen_width = db.Column(db.Integer, nullable=False)
    screen_height = db.Column(db.Integer, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
