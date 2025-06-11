from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response
import os
import logging
from werkzeug.exceptions import BadRequest
# from logging_module import log_interaction_data, log_device_details
# from models import db, InteractionLog, DeviceDetail
# from azure.identity import DefaultAzureCredential
# from dotenv import load_dotenv
# from datetime import datetime, timedelta

# Load environment variables from .env file
# load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Set up secret key using environment variable for production
app.secret_key = os.environ.get("FLASK_SECRET_KEY", os.urandom(24))  # Default to random if not set

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configure SQLAlchemy using Managed Identity
# db_server = os.environ.get('AZURE_SQL_SERVER')
# db_database = os.environ.get('AZURE_SQL_DATABASE')
# managed_identity_client_id = os.environ.get('AZURE_MANAGED_IDENTITY_CLIENT_ID')

# Obtain an access token using Managed Identity
# credential = DefaultAzureCredential(managed_identity_client_id=managed_identity_client_id)
# token_info = credential.get_token("https://database.windows.net/")
# token = token_info.token
# token_expiry = datetime.now() + timedelta(seconds=token_info.expires_on - datetime.now().timestamp())

# def get_db_connection_string():
#     global token, token_expiry
#     if datetime.now() >= token_expiry:
#         token_info = credential.get_token("https://database.windows.net/")
#         token = token_info.token
#         token_expiry = datetime.now() + timedelta(seconds=token_info.expires_on - datetime.now().timestamp())
#     return f"mssql+pyodbc://@{db_server}/{db_database}?driver=ODBC+Driver+17+for+SQL+Server&authentication=ActiveDirectoryMsi&access_token={token}"

# app.config['SQLALCHEMY_DATABASE_URI'] = get_db_connection_string()
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)

# # Create tables
# with app.app_context():
#     db.create_all()

def get_user_details_from_cookies():
    user_name = request.cookies.get('user_name', 'John Doe')
    user_email = request.cookies.get('user_email', 'thejohndoe@gmail.com')
    return user_name, user_email

def generate_initials(name):
    return ''.join([word[0].upper() for word in name.split()])

app.jinja_env.filters['initials'] = generate_initials

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route("/", methods=["GET", "POST"])
def home():
    user_name, user_email = get_user_details_from_cookies()
    logging.info("Home route accessed.")
    return render_template("homepage_v2.html", user_name=user_name, user_email=user_email)

@app.route("/resume")
def resume():
    user_name, user_email = get_user_details_from_cookies()
    logging.info("Resume route accessed.")
    return render_template("resume.html", user_name=user_name, user_email=user_email)

@app.route("/contact")
def contact():
    user_name, user_email = get_user_details_from_cookies()
    logging.info("Contact route accessed.")
    return render_template("contactme.html", user_name=user_name, user_email=user_email)

@app.route("/about")
def about():
    user_name, user_email = get_user_details_from_cookies()
    logging.info("About Me route accessed.")
    return render_template("aboutme.html", user_name=user_name, user_email=user_email)

@app.route("/projects")
def projects():
    user_name, user_email = get_user_details_from_cookies()
    logging.info("Projects route accessed.")
    return render_template("projects_v2.html", user_name=user_name, user_email=user_email)

@app.route("/set_name", methods=["POST"])
def set_name():
    try:
        data = request.get_json()  # Get JSON data from request
        if not data:
            raise BadRequest("Request body must be JSON.")  # Raise error if not valid JSON

        user_name = data.get('user_name', '').strip()
        user_email = data.get('user_email', '').strip()
        if user_name and user_email:
            session['user_name'] = user_name  # Update session variable
            session['user_email'] = user_email  # Update session variable
            logging.info(f"User name set to: {user_name} and email set to: {user_email}")

            # Set cookies for user data
            response = make_response(jsonify({"success": True, "user_name": user_name, "user_email": user_email}))
            response.set_cookie('user_name', user_name, max_age=30*24*60*60)  # Set cookie for 30 days
            response.set_cookie('user_email', user_email, max_age=30*24*60*60)  # Set cookie for 30 days
            return response
        else:
            logging.warning("No user name or email provided in request.")
            return jsonify({"success": False, "message": "Invalid name or email provided."}), 400
    except BadRequest as e:
        logging.error(f"BadRequest error: {e}")
        return jsonify({"success": False, "message": "Invalid JSON request."}), 400
    except Exception as e:
        logging.exception(f"Unexpected error in set_name: {e}")
        return jsonify({"success": False, "message": "Internal server error."}), 500

@app.route("/track_device", methods=["POST"])
def track_device():
    try:
        device_details = request.get_json()
        if not device_details:
            raise BadRequest("Request body must be JSON.")
        
        # Log device details
        logging.info(f"Device details: {device_details}")
        # log_device_details(device_details)
        
        return jsonify({"success": True, "message": "Device details tracked successfully."})
    except BadRequest as e:
        logging.error(f"BadRequest error: {e}")
        return jsonify({"success": False, "message": "Invalid JSON request."}), 400
    except Exception as e:
        logging.exception(f"Unexpected error in track_device: {e}")
        return jsonify({"success": False, "message": "Internal server error."}), 500

@app.route("/track_interaction", methods=["POST"])
def track_interaction():
    try:
        interaction_data = request.get_json()
        if not interaction_data:
            raise BadRequest("Request body must be JSON.")
        
        # Log interaction data
        logging.info(f"Interaction data: {interaction_data}")
        # log_interaction_data(interaction_data)
        
        return jsonify({"success": True, "message": "Interaction data tracked successfully."})
    except BadRequest as e:
        logging.error(f"BadRequest error: {e}")
        return jsonify({"success": False, "message": "Invalid JSON request."}), 400
    except Exception as e:
        logging.exception(f"Unexpected error in track_interaction: {e}")
        return jsonify({"success": False, "message": "Internal server error."}), 500

@app.route("/logout")
def logout():
    logging.info("Logout route accessed.")  # Log route access
    logging.debug("Clearing session data and logging out.")
    session.clear()  # Clear all session data to log out user

    # Clear cookies
    response = make_response(redirect(url_for('home')))
    response.set_cookie('user_name', '', expires=0)
    response.set_cookie('user_email', '', expires=0)
    logging.info("Redirecting to home after logout.")  # Log redirection
    return response

if __name__ == "__main__":
    logging.info("Starting Flask app.")  # Log app startup
    app.run(debug=True)  # Enable debug mode for development purposes
