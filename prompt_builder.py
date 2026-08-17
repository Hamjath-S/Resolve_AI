incident = """
Users are unable to log in after today's deployment.
The application returns HTTP 500.
"""

prompt = f"""
You are an experienced IT Support Engineer.

Analyze the following IT incident.

Return:

1. Category
2. Priority
3. Possible Root Cause
4. Recommended Resolution

Keep the answer practical and suitable for an IT support team.

Incident:
{incident}
"""

print(prompt)