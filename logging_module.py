import logging
from datetime import datetime
from models import db, InteractionLog, DeviceDetail

def log_interaction_data(interaction_data):
    try:
        interaction_log = InteractionLog(
            user_id=interaction_data['userId'],
            event_type=interaction_data['eventType'],
            details=str(interaction_data['details']),
            timestamp=datetime.fromisoformat(interaction_data['timestamp'])
        )
        db.session.add(interaction_log)
        db.session.commit()
        logging.info("Interaction data logged successfully.")
    except Exception as e:
        logging.error(f"Error logging interaction data: {e}")

def log_device_details(device_details):
    try:
        device_detail = DeviceDetail(
            user_agent=device_details['userAgent'],
            platform=device_details['platform'],
            screen_width=device_details['screenWidth'],
            screen_height=device_details['screenHeight'],
            language=device_details['language'],
            timestamp=datetime.now()
        )
        db.session.add(device_detail)
        db.session.commit()
        logging.info("Device details logged successfully.")
    except Exception as e:
        logging.error(f"Error logging device details: {e}")
