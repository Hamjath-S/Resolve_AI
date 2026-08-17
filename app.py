# ResolveAI - AI Powered IT Incident Analyzer

from ai_analyzer import analyze_with_ai
from database import create_database, save_incident


# Create database if it doesn't exist
create_database()


print("=" * 60)
print("                 RESOLVEAI")
print("          AI-Powered IT Incident Analyzer")
print("=" * 60)


# Get incident details
print("\nEnter Incident Details")
print("-" * 60)

ticket_id = input("Ticket ID: ")
title = input("Incident Title: ")
priority = input("Priority (Low/Medium/High/Critical): ")
description = input("Incident Description: ")

status = "Open"


incident_text = f"""
Ticket ID: {ticket_id}
Title: {title}
Priority: {priority}
Status: {status}
Description: {description}
"""


print("\nSending incident to AI...")
print("Please wait...\n")


# Analyze incident using Gemini
ai_result = analyze_with_ai(incident_text)


print("=" * 60)
print("              AI INCIDENT ANALYSIS")
print("=" * 60)

print(f"\nCategory:")
print(ai_result["category"])

print(f"\nPriority:")
print(ai_result["priority"])

print(f"\nPossible Root Cause:")
print(ai_result["root_cause"])

print(f"\nRecommended Resolution:")
print(ai_result["resolution"])


# Save structured AI result
save_incident(
    ticket_id=ticket_id,
    title=title,
    description=description,
    priority=ai_result["priority"],
    status=status,
    category=ai_result["category"],
    root_cause=ai_result["root_cause"],
    resolution=ai_result["resolution"]
)


print("\n" + "=" * 60)
print("Incident saved successfully to ResolveAI database.")
print("Analysis completed successfully.")