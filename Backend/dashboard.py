import streamlit as st
from datetime import datetime
from Backend.ai_analyzer import analyze_with_ai
from database import create_database, save_incident


# --------------------------------------------------
# Create Database
# --------------------------------------------------

create_database()


# --------------------------------------------------
# Page Configuration
# --------------------------------------------------

st.set_page_config(
    page_title="ResolveAI",
    page_icon="🤖",
    layout="wide"
)


# --------------------------------------------------
# Header
# --------------------------------------------------

st.title("🤖 ResolveAI")
st.subheader("AI-Powered IT Incident Resolution Agent")

st.write(
    "Describe your IT incident and let ResolveAI automatically "
    "analyze the issue, determine priority, identify the root cause, "
    "and recommend a resolution."
)

st.divider()


# --------------------------------------------------
# Incident Input
# --------------------------------------------------

st.header("📝 Report an IT Incident")

incident_description = st.text_area(
    "Describe your incident",
    placeholder=(
        "Example: Users are unable to login to the company portal. "
        "The error started after the latest server update."
    ),
    height=180
)


# --------------------------------------------------
# Analyze Button
# --------------------------------------------------

if st.button(
    "🔍 Analyze Incident",
    type="primary",
    use_container_width=True
):

    if not incident_description.strip():

        st.warning(
            "Please describe the IT incident before analyzing."
        )

    else:
        ticket_id = f"INC-{datetime.now().year}-{datetime.now().strftime('%m%d%H%M%S')}"
        with st.spinner(
            "🤖 ResolveAI is analyzing the incident..."
        ):

            try:

                # --------------------------------------------------
                # Send ONLY the user's incident to Gemini
                # --------------------------------------------------

                ai_result = analyze_with_ai(
                    incident_description
                )


                # --------------------------------------------------
                # Generate Ticket ID
                # --------------------------------------------------

                ticket_id = ai_result.get(
                    "ticket_id",
                    "AUTO-GENERATED"
                )


                # --------------------------------------------------
                # Display Results
                # --------------------------------------------------

                st.divider()

                st.header("🧠 AI Incident Analysis")


                # Ticket ID
                st.markdown("### 🎫 Ticket ID")

                st.info(ticket_id)


                # Category + Priority
                col1, col2 = st.columns(2)

                with col1:

                    st.markdown("### 📂 Category")

                    st.info(
                        ai_result["category"]
                    )


                with col2:

                    st.markdown("### 🚨 Priority")

                    priority = ai_result["priority"]

                    if priority == "Critical":

                        st.error(priority)

                    elif priority == "High":

                        st.warning(priority)

                    else:

                        st.info(priority)


                # Root Cause
                st.markdown("### 🔍 Root Cause")

                st.write(
                    ai_result["root_cause"]
                )


                # Resolution
                st.markdown("### 🛠️ Recommended Resolution")

                st.success(
                    ai_result["resolution"]
                )


                # Status
                st.markdown("### 📌 Status")

                st.info(
                    ai_result.get(
                        "status",
                        "Open"
                    )
                )


                # --------------------------------------------------
                # Save Incident
                # --------------------------------------------------

                save_incident(
                    ticket_id=ticket_id,
                    title="AI Generated Incident",
                    description=incident_description,
                    priority=ai_result["priority"],
                    status=ai_result.get(
                        "status",
                        "Open"
                    ),
                    category=ai_result["category"],
                    root_cause=ai_result["root_cause"],
                    resolution=ai_result["resolution"]
                )


                st.success(
                    "✅ Incident analyzed and saved successfully!"
                )


            except Exception as e:

                st.error(
                    f"❌ AI analysis failed: {e}"
                )