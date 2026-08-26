# ==================================================
# RESOLVEAI AUTONOMOUS INCIDENT AGENT
# ==================================================

from Backend.agent_planner import plan_next_action

from Backend.agent_tools import (
    knowledge_search,
    similar_incident_search,
    ticket_lookup
)

from Backend.ai_analyzer import analyze_with_ai


# ==================================================
# MAXIMUM AGENT STEPS
# ==================================================

MAX_AGENT_STEPS = 5


# ==================================================
# RUN RESOLVEAI AGENT
# ==================================================

def run_agent(
    incident,
    top_k=3
):

    print("\n")
    print("==========================================")
    print("        RESOLVEAI AUTONOMOUS AGENT")
    print("==========================================")


    # ==================================================
    # AGENT STATE
    # ==================================================

    observations = []

    tools_used = []

    knowledge_results = []

    similar_results = []

    ticket_results = []

    # --------------------------------------------------
    # NEW: FRONTEND-FRIENDLY EXECUTION TRACE
    # --------------------------------------------------

    execution_trace = []


    # ==================================================
    # AGENT LOOP
    # ==================================================

    for step in range(
        1,
        MAX_AGENT_STEPS + 1
    ):

        print("\n")
        print("------------------------------------------")

        print(
            f"AGENT STEP {step}/{MAX_AGENT_STEPS}"
        )

        print(
            "------------------------------------------"
        )


        # ==================================================
        # ASK PLANNER
        # ==================================================

        try:

            decision = plan_next_action(

                incident=incident,

                observations=observations,

                available_tools=[
                    "knowledge_search",
                    "similar_incident_search",
                    "ticket_lookup"
                ]

            )

        except Exception as e:

            execution_trace.append({

                "step": step,

                "type": "planner",

                "action": "planner",

                "reason": "Agent planner failed.",

                "status": "failed",

                "error": str(e)

            })

            raise


        action = decision["action"]

        reason = decision["reason"]


        # ==================================================
        # RECORD PLANNER DECISION
        # ==================================================

        planner_trace = {

            "step": step,

            "type": "planner",

            "action": action,

            "reason": reason,

            "status": "decided"

        }


        execution_trace.append(
            planner_trace
        )


        # ==================================================
        # FINISH
        # ==================================================

        if action == "finish":

            print(
                "\nAgent decided:"
            )

            print(
                "Enough information gathered."
            )


            execution_trace.append({

                "step": step,

                "type": "agent",

                "action": "finish",

                "reason": reason,

                "status": "completed"

            })


            break


        # ==================================================
        # KNOWLEDGE SEARCH
        # ==================================================

        if action == "knowledge_search":

            print(
                "\n[AGENT ACTION]"
            )

            print(
                "Calling Knowledge Search Tool..."
            )


            tool_trace = {

                "step": step,

                "type": "tool",

                "action":
                    "knowledge_search",

                "reason":
                    reason,

                "status":
                    "running",

                "result_count":
                    0

            }


            execution_trace.append(
                tool_trace
            )


            try:

                result = knowledge_search(

                    query=(

                        incident.get(
                            "title",
                            ""
                        )

                        + "\n"

                        + incident.get(
                            "description",
                            ""
                        )

                    ),

                    top_k=top_k

                )


                # ------------------------------------------
                # NORMALIZE RESULT
                # ------------------------------------------

                if result is None:

                    result = []


                if not isinstance(
                    result,
                    list
                ):

                    result = [result]


                knowledge_results.extend(
                    result
                )


                observations.append({

                    "tool":
                        "knowledge_search",

                    "result":
                        result

                })


                tools_used.append(
                    "knowledge_search"
                )


                tool_trace[
                    "status"
                ] = "completed"


                tool_trace[
                    "result_count"
                ] = len(result)


                print(
                    f"Knowledge results: {len(result)}"
                )


            except Exception as e:

                tool_trace[
                    "status"
                ] = "failed"


                tool_trace[
                    "error"
                ] = str(e)


                observations.append({

                    "tool":
                        "knowledge_search",

                    "result": {

                        "error":
                            str(e)

                    }

                })


                print(
                    "Knowledge Search failed:",
                    str(e)
                )


                # Do not crash the entire agent
                # because one tool failed.


        # ==================================================
        # SIMILAR INCIDENT SEARCH
        # ==================================================

        elif action == "similar_incident_search":

            print(
                "\n[AGENT ACTION]"
            )

            print(
                "Calling Similar Incident Search Tool..."
            )


            tool_trace = {

                "step": step,

                "type": "tool",

                "action":
                    "similar_incident_search",

                "reason":
                    reason,

                "status":
                    "running",

                "result_count":
                    0

            }


            execution_trace.append(
                tool_trace
            )


            try:

                result = similar_incident_search(

                    incident=incident,

                    top_k=top_k

                )


                # ------------------------------------------
                # NORMALIZE RESULT
                # ------------------------------------------

                if result is None:

                    result = []


                if not isinstance(
                    result,
                    list
                ):

                    result = [result]


                similar_results.extend(
                    result
                )


                observations.append({

                    "tool":
                        "similar_incident_search",

                    "result":
                        result

                })


                tools_used.append(
                    "similar_incident_search"
                )


                tool_trace[
                    "status"
                ] = "completed"


                tool_trace[
                    "result_count"
                ] = len(result)


                print(
                    f"Similar incidents found: "
                    f"{len(result)}"
                )


            except Exception as e:

                tool_trace[
                    "status"
                ] = "failed"


                tool_trace[
                    "error"
                ] = str(e)


                observations.append({

                    "tool":
                        "similar_incident_search",

                    "result": {

                        "error":
                            str(e)

                    }

                })


                print(
                    "Similar Incident Search failed:",
                    str(e)
                )


        # ==================================================
        # TICKET LOOKUP
        # ==================================================

        elif action == "ticket_lookup":

            ticket_id = incident.get(
                "ticket_id"
            )


            # --------------------------------------------------
            # NO TICKET ID
            # --------------------------------------------------

            if not ticket_id:

                print(
                    "\nTicket lookup skipped:"
                )

                print(
                    "No ticket ID available."
                )


                execution_trace.append({

                    "step": step,

                    "type": "tool",

                    "action":
                        "ticket_lookup",

                    "reason":
                        reason,

                    "status":
                        "skipped",

                    "result_count":
                        0,

                    "message":
                        "No ticket ID available."

                })


                observations.append({

                    "tool":
                        "ticket_lookup",

                    "result": {

                        "error":
                            "No ticket ID available."

                    }

                })


                continue


            print(
                "\n[AGENT ACTION]"
            )

            print(
                "Calling Ticket Lookup Tool..."
            )


            tool_trace = {

                "step": step,

                "type": "tool",

                "action":
                    "ticket_lookup",

                "reason":
                    reason,

                "status":
                    "running",

                "result_count":
                    0

            }


            execution_trace.append(
                tool_trace
            )


            try:

                result = ticket_lookup(
                    ticket_id
                )


                ticket_results.append(
                    result
                )


                observations.append({

                    "tool":
                        "ticket_lookup",

                    "result":
                        result

                })


                tools_used.append(
                    "ticket_lookup"
                )


                tool_trace[
                    "status"
                ] = "completed"


                tool_trace[
                    "result_count"
                ] = 1


                print(
                    "Ticket lookup completed."
                )


            except Exception as e:

                tool_trace[
                    "status"
                ] = "failed"


                tool_trace[
                    "error"
                ] = str(e)


                observations.append({

                    "tool":
                        "ticket_lookup",

                    "result": {

                        "error":
                            str(e)

                    }

                })


                print(
                    "Ticket lookup failed:",
                    str(e)
                )


    # ==================================================
    # BUILD FINAL KNOWLEDGE CONTEXT
    # ==================================================

    final_context_parts = []


    # --------------------------------------------------
    # KNOWLEDGE RESULTS
    # --------------------------------------------------

    for item in knowledge_results:

        final_context_parts.append(
            str(item)
        )


    # --------------------------------------------------
    # SIMILAR INCIDENT RESULTS
    # --------------------------------------------------

    for item in similar_results:

        final_context_parts.append(
            str(item)
        )


    # --------------------------------------------------
    # TICKET RESULTS
    # --------------------------------------------------

    for item in ticket_results:

        final_context_parts.append(
            str(item)
        )


    final_context = "\n\n".join(
        final_context_parts
    )


    # ==================================================
    # FINAL AI ANALYSIS
    # ==================================================

    print("\n")
    print("==========================================")
    print("AGENT → FINAL AI ANALYSIS")
    print("==========================================")


    # --------------------------------------------------
    # RECORD FINAL ANALYSIS START
    # --------------------------------------------------

    execution_trace.append({

        "step":
            len(execution_trace) + 1,

        "type":
            "ai_analysis",

        "action":
            "final_ai_analysis",

        "reason":
            "Analyze all evidence collected by the agent.",

        "status":
            "running"

    })


    try:

        ai_result = analyze_with_ai(

            incident=incident,

            knowledge_context=final_context

        )


        # --------------------------------------------------
        # MARK ANALYSIS COMPLETE
        # --------------------------------------------------

        execution_trace[-1][
            "status"
        ] = "completed"


    except Exception as e:

        execution_trace[-1][
            "status"
        ] = "failed"


        execution_trace[-1][
            "error"
        ] = str(e)


        raise


    # ==================================================
    # FINAL RESULT
    # ==================================================

    result = {

        "incident":
            incident,

        "tools_used":
            tools_used,

        "agent_steps":
            len(execution_trace),

        "observations":
            observations,

        "retrieved_knowledge":
            knowledge_results,

        "similar_incidents":
            similar_results,

        "ticket_results":
            ticket_results,

        "execution_trace":
            execution_trace,

        "ai_result":
            ai_result,

        "agent_status":
            "completed"

    }


    # ==================================================
    # COMPLETE
    # ==================================================

    print("\n")
    print("==========================================")
    print("RESOLVEAI AGENT COMPLETED")
    print("==========================================")


    print(
        f"Tools used: {tools_used}"
    )


    print(
        f"Agent execution events: "
        f"{len(execution_trace)}"
    )


    print(
        f"Final category: "
        f"{ai_result.get('category')}"
    )


    print(
        f"Final priority: "
        f"{ai_result.get('priority')}"
    )


    print(
        f"Final status: "
        f"{ai_result.get('status')}"
    )


    print("==========================================\n")


    return result


# ==================================================
# TEST AGENT
# ==================================================

if __name__ == "__main__":

    test_incident = {

        "title":
        "Users unable to log in after deployment",

        "description":
        (
            "Users are unable to log in after "
            "today's deployment. "
            "The application returns HTTP 500."
        )

    }


    result = run_agent(

        test_incident,

        top_k=3

    )


    print("\n")
    print("==========================================")
    print("FINAL AGENT RESULT")
    print("==========================================")


    print(
        result
    )


    print("\n")
    print("==========================================")
    print("AGENT EXECUTION TRACE")
    print("==========================================")


    for event in result.get(
        "execution_trace",
        []
    ):

        print(
            event
        )


    print("\n")
    print("==========================================")
    print("AGENT TEST COMPLETED")
    print("==========================================")