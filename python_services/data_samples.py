# # python_services/data_samples.py

# """
# Structured data samples for AI indoor environment recommendation model.
# Extracted from raw MongoDB-style documents.
# """

# # 🧍 USER INFORMATION ------------------------------------------------------

# user_info = {
#     "username": "user1",
#     "age": 21,
#     "gender": "Male",
#     "ethnicity": "Indian",
#     "email": "user1@gmail.com",
#     "health_issues": ["asthma"],
#     "questionnaire": [
#         {
#             "question": "How comfortable do you currently feel in your environment?",
#             "answer": 1
#         },
#         {
#             "question": "How would you rate the air quality around you?",
#             "answer": 1
#         },
#         {
#             "question": "How satisfied are you with the current temperature and humidity?",
#             "answer": 1
#         },
#         {
#             "question": "If you feel discomfort, what do you think is the main reason?",
#             "answer": "noth"
#         },
#         {
#             "question": "What could improve your comfort in this environment?",
#             "answer": "jnot"
#         }
#     ]
# }


# # 🌫️ INDOOR POLLUTANTS ------------------------------------------------------

# indoor_pollutants = {
#     "temperature": 35.79,
#     "humidity": 77.59,
#     "pressure": 0,
#     "pm1": 25,
#     "pm2_5": 40,
#     "pm10": 40,
#     "co": 0,
#     "voc": 4.623,
#     "co2": 2000,
#     "timestamp": "2025-10-27 18:41:27"
# }


# # 🌤️ OUTDOOR POLLUTANTS ------------------------------------------------------

# outdoor_pollutants = {
#     "pm10": 46.3,
#     "pm2_5": 45.2,
#     "carbon_monoxide": 38,
#     "dust": 2,
#     "temperature_2m": 21,
#     "relative_humidity_2m": 66,
#     "wind_speed_10m": 9.5,
#     "wind_direction_10m": 99,
#     "wind_gusts_10m": 23.8,
#     "rain": 0,
#     "precipitation": 0,
#     "is_day": 1,
#     "timestamp": "2025-10-28 12:32:00"
# }


# # 🏠 ROOM INFORMATION ------------------------------------------------------

# room_info = {
#     "room_name": "Hall",
#     "length": 20,
#     "width": 20,
#     "height": 20,
#     "occupancy": 2,
#     "num_doors": 1,
#     "num_windows": 1
# }


# # ⚙️ APPLIANCES ------------------------------------------------------

# # Derived from the room information's appliances list
# appliances = {
#     "AC": False,
#     "CEILING_FAN": True,
#     "EXHAUST_FAN": False,  # Not mentioned in raw data
#     "WINDOW": True,
#     "DOOR": True
# }


# # ✅ DEBUG CHECK ------------------------------------------------------

# if __name__ == "__main__":
#     print(" USER INFO:", user_info, "\n")
#     print(" INDOOR POLLUTANTS:", indoor_pollutants, "\n")
#     print(" OUTDOOR POLLUTANTS:", outdoor_pollutants, "\n")
#     print(" ROOM INFO:", room_info, "\n")
#     print(" APPLIANCES:", appliances, "\n")




# python_services/data_samples.py
"""
Data preprocessing utilities for the Indoor Comfort AI system.
Transforms raw MongoDB-style documents into normalized dictionaries.
"""

def extract_user_info(raw_user: dict) -> dict:
    """Extract user information in the expected format."""
    if not raw_user:
        return {}
    
    return {
        "username": raw_user.get("name"),
        "age": raw_user.get("age"),
        "gender": raw_user.get("gender", "").capitalize(),
        "ethnicity": raw_user.get("ethnicity", "").capitalize(),
        "email": raw_user.get("email"),
        "health_issues": raw_user.get("health_issues", []),
        "questionnaire": raw_user.get("questionnaire", [])
    }


def extract_room_info(raw_room: dict) -> dict:
    """Extract room dimensions and occupancy."""
    if not raw_room:
        return {}
    
    return {
        "room_name": raw_room.get("room_name"),
        "length": raw_room.get("room_length"),
        "width": raw_room.get("room_width"),
        "height": raw_room.get("room_height"),
        "occupancy": raw_room.get("occupancy"),
        "num_doors": raw_room.get("doors", 0),
        "num_windows": raw_room.get("windows", 0)
    }


def extract_appliances(raw_room: dict) -> dict:
    """Generate a boolean appliances dictionary based on available list."""
    if not raw_room or "appliances" not in raw_room:
        return {}
    
    appliance_list = raw_room.get("appliances", [])
    normalized = {}
    all_possible = ["AC", "CEILING_FAN", "EXHAUST_FAN", "WINDOW", "DOOR"]
    
    for appliance in all_possible:
        # Check if a close match exists (case-insensitive, with spaces removed)
        found = any(a.lower().replace(" ", "_") == appliance.lower() for a in appliance_list)
        normalized[appliance] = found
    
    return normalized


def extract_indoor_pollutants(raw_indoor: dict) -> dict:
    """Extract indoor sensor pollutant readings."""
    if not raw_indoor:
        return {}
   
    activity  = raw_indoor.get("activityData", raw_indoor)  # supports both nested and flat formats
    data = activity.get("data", activity)
    return {
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
        "pressure": data.get("pressure"),
        "pm1": data.get("pm1"),
        "pm2_5": data.get("pm2_5"),
        "pm10": data.get("pm10"),
        "co": data.get("co"),
        "voc": data.get("voc"),
        "co2": data.get("co2"),
        "timestamp": raw_indoor.get("timestamp")
    }


def extract_outdoor_pollutants(raw_outdoor: dict) -> dict:
    """Extract outdoor weather and air quality data."""
    if not raw_outdoor:
        return {}

    activity = raw_outdoor.get("activityData", raw_outdoor)
    meta = raw_outdoor.get("metaData", {})

    return {
        "pm10": activity.get("pm10"),
        "pm2_5": activity.get("pm2_5"),
        "carbon_monoxide": activity.get("carbon_monoxide"),
        "dust": activity.get("dust"),
        "temperature_2m": activity.get("temperature_2m"),
        "relative_humidity_2m": activity.get("relative_humidity_2m"),
        "wind_speed_10m": meta.get("wind_speed_10m"),
        "wind_direction_10m": meta.get("wind_direction_10m"),
        "wind_gusts_10m": meta.get("wind_gusts_10m"),
        "rain": meta.get("rain"),
        "precipitation": meta.get("precipitation"),
        "is_day": meta.get("is_day"),
        "timestamp": raw_outdoor.get("timestamp")
    }


def prepare_environment_data(user, room, indoor, outdoor):
    """Master function: converts all raw data into AI-ready structured format."""
    user_info = extract_user_info(user)
    room_info = extract_room_info(room)
    appliances = extract_appliances(room)
    indoor_pollutants = extract_indoor_pollutants(indoor)
    outdoor_pollutants = extract_outdoor_pollutants(outdoor)
    
    return room_info, appliances, user_info, indoor_pollutants, outdoor_pollutants
