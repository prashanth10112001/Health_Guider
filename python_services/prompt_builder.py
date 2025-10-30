def build_prompt(room_info, appliances, user_info, indoor_pollutants, outdoor_pollutants):
    """
    Builds a natural-language prompt for the Gemini model.
    Dynamically includes only available appliances in constraints and output format.
    """

    # Define possible appliances and their allowed ranges/options
    appliance_constraints = {
        "AC": [
            "- `AC_MODE`: one of ['OFF', 'COOL', 'FAN']",
            "- `AC_TEMPERATURE`: integer between 16–30°C",
        ],
        "CEILING_FAN": ["- `CEILING_FAN`: integer between 0–5"],
        "WINDOW": ["- `WINDOW`: 'OPEN' or 'CLOSED'"],
        "DOOR": ["- `DOOR`: 'OPEN' or 'CLOSED'"],
        "EXHAUST_FAN": ["- `EXHAUST_FAN`: 'ON' or 'OFF'"],
    }

    # Template examples for output JSON
    appliance_output_examples = {
        "AC": ['  "AC_MODE": "COOL",', '  "AC_TEMPERATURE": 23,'],
        "CEILING_FAN": ['  "CEILING_FAN": 3,'],
        "WINDOW": ['  "WINDOW": "CLOSED",'],
        "DOOR": ['  "DOOR": "CLOSED",'],
        "EXHAUST_FAN": ['  "EXHAUST_FAN": "ON",'],
    }

    # Filter active constraints & outputs
    active_constraints = []
    active_output_lines = ['  "reason": "Brief explanation of why each setting was chosen.",']

    for key, is_present in appliances.items():
        if is_present:
            if key in appliance_constraints:
                active_constraints.extend(appliance_constraints[key])
            if key in appliance_output_examples:
                active_output_lines.extend(appliance_output_examples[key])

    # Always include recheck field
    active_constraints.append("- `RECHECK_AT`: integer number of minutes to re-evaluate the environment")
    active_output_lines.append('  "RECHECK_AT": 15')

    # Format sections
    constraints_text = "\n".join(active_constraints)
    output_example = "{\n" + "\n".join(active_output_lines) + "\n}"

    # Build final prompt
    return f"""
You are an advanced **Indoor Environmental Comfort & Air Quality AI Assistant**.
Your goal is to provide *personalized appliance recommendations* to optimize
comfort, air quality, and energy efficiency — based on **indoor/outdoor conditions**,
**user feedback**, and **room configuration**.

---

###  ROOM INFORMATION
- Name: {room_info.get('room_name')}
- Dimensions (Length × Width × Height): {room_info.get('length')}m × {room_info.get('width')}m × {room_info.get('height')}m
- Occupancy: {room_info.get('occupancy')}
- Number of Doors: {room_info.get('num_doors')}
- Number of Windows: {room_info.get('num_windows')}

###  AVAILABLE APPLIANCES
{appliances}

---

###  USER INFORMATION
- Name: {user_info.get('username')}
- Age: {user_info.get('age')}
- Gender: {user_info.get('gender')}
- Ethnicity: {user_info.get('ethnicity')}
- Health Issues: {user_info.get('health_issues')}

**Recent Comfort Feedback:**
{user_info.get('questionnaire')}

---

###  INDOOR ENVIRONMENT AND POLLUTANT DATA
{indoor_pollutants}

###  OUTDOOR ENVIRONMENT AND POLLUTANT DATA
{outdoor_pollutants}

---

###  GOAL
You must analyze all the above data and **recommend appliance settings** that:
1. Improve thermal comfort (temperature & humidity balance, air movement).
2. Maintain healthy indoor air quality (minimize pollutants like CO₂, VOC, PM2.5).
3. Respect user health conditions (e.g., asthma → avoid dust or VOCs).
4. Respond to outdoor air conditions (e.g., close windows if outdoor AQI is poor).
5. Optimize energy efficiency without compromising comfort.

---

###  CONSTRAINTS
Your response must strictly follow these constraints:
Stay within valid ranges and allowed values:
{constraints_text}

---

###  OUTPUT FORMAT
Return your output **strictly in valid JSON**, following this schema:
{output_example}
"""
