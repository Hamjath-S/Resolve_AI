import { useEffect, useState } from 'react'

const agentStages = [
  {
    id: '01',
    title: 'Incident Intake',
    description: 'Receives and structures the incoming IT incident.',
  },
  {
    id: '02',
    title: 'Knowledge Retrieval',
    description: 'Searches the ResolveAI knowledge base for relevant evidence.',
  },
  {
    id: '03',
    title: 'AI Reasoning',
    description: 'Analyzes symptoms and determines the probable root cause.',
  },
  {
    id: '04',
    title: 'Resolution Planning',
    description: 'Generates practical troubleshooting actions.',
  },
  {
    id: '05',
    title: 'Ticket Management',
    description: 'Creates and manages the incident lifecycle.',
  },
]

export default function AIAgent() {
  const [agentState, setAgentState] = useState('idle')
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    if (agentState !== 'running') return

    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= agentStages.length - 1) {
          setAgentState('completed')
          return prev
        }

        return prev + 1
      })
    }, 900)

    return () => clearInterval(interval)
  }, [agentState])

  function startAgent() {
    setActiveStage(0)
    setAgentState('running')
  }

  function resetAgent() {
    setActiveStage(0)
    setAgentState('idle')
  }

  const isRunning = agentState === 'running'
  const isCompleted = agentState === 'completed'

  return (
    <main className="agent-page">

      {/* ================================================
          PAGE HEADER
      ================================================ */}

      <section className="agent-page-header">

        <div>
          <span className="agent-eyebrow">
            AUTONOMOUS IT OPERATIONS
          </span>

          <h1>
            AI Agent Control Center
          </h1>

          <p>
            Monitor how ResolveAI receives incidents, retrieves
            knowledge, reasons over technical evidence, and
            generates resolution plans.
          </p>
        </div>

        <div className="agent-status-card">

          <span
            className={`agent-status-dot ${
              isRunning
                ? 'running'
                : isCompleted
                  ? 'completed'
                  : 'idle'
            }`}
          />

          <div>
            <span className="agent-status-label">
              AGENT STATUS
            </span>

            <strong>
              {isRunning
                ? 'Processing'
                : isCompleted
                  ? 'Execution Complete'
                  : 'Ready'}
            </strong>
          </div>

        </div>

      </section>


      {/* ================================================
          AGENT OVERVIEW
      ================================================ */}

      <section className="agent-metrics">

        <div className="agent-metric-card">
          <span>AGENT MODE</span>
          <strong>Autonomous</strong>
          <small>AI-driven incident reasoning</small>
        </div>

        <div className="agent-metric-card">
          <span>KNOWLEDGE ENGINE</span>
          <strong>RAG + ChromaDB</strong>
          <small>Context-aware retrieval</small>
        </div>

        <div className="agent-metric-card">
          <span>REASONING ENGINE</span>
          <strong>Gemini AI</strong>
          <small>Incident analysis</small>
        </div>

        <div className="agent-metric-card">
          <span>EXECUTION</span>
          <strong>
            {isRunning
              ? `${activeStage + 1}/5`
              : isCompleted
                ? '5/5'
                : '0/5'}
          </strong>
          <small>Agent workflow stages</small>
        </div>

      </section>


      {/* ================================================
          MAIN AGENT WORKSPACE
      ================================================ */}

      <section className="agent-workspace">

        {/* -----------------------------------------------
            LEFT — AGENT PIPELINE
        ----------------------------------------------- */}

        <div className="agent-panel pipeline-panel">

          <div className="agent-panel-header">

            <div>
              <span className="agent-panel-eyebrow">
                EXECUTION PIPELINE
              </span>

              <h2>
                Autonomous workflow
              </h2>
            </div>

            <span className="pipeline-count">
              05 STAGES
            </span>

          </div>


          <div className="agent-pipeline">

            {agentStages.map((stage, index) => {

              const completed =
                isCompleted || index < activeStage

              const active =
                isRunning && index === activeStage

              return (
                <div
                  key={stage.id}
                  className={`pipeline-stage ${
                    active ? 'active' : ''
                  } ${
                    completed ? 'completed' : ''
                  }`}
                >

                  <div className="pipeline-marker">

                    {completed ? (
                      '✓'
                    ) : (
                      stage.id
                    )}

                  </div>

                  <div className="pipeline-content">

                    <div className="pipeline-title-row">

                      <strong>
                        {stage.title}
                      </strong>

                      {active && (
                        <span className="stage-live">
                          LIVE
                        </span>
                      )}

                      {completed && (
                        <span className="stage-complete">
                          COMPLETE
                        </span>
                      )}

                    </div>

                    <p>
                      {stage.description}
                    </p>

                  </div>

                </div>
              )
            })}

          </div>

        </div>


        {/* -----------------------------------------------
            RIGHT — AGENT INTELLIGENCE
        ----------------------------------------------- */}

        <div className="agent-panel intelligence-panel">

          <div className="agent-panel-header">

            <div>
              <span className="agent-panel-eyebrow">
                AGENT INTELLIGENCE
              </span>

              <h2>
                Reasoning environment
              </h2>
            </div>

            <div className="agent-core">
              <span />
              <span />
              <span />
            </div>

          </div>


          <div className="agent-core-display">

            <div className="core-ring core-ring-one" />
            <div className="core-ring core-ring-two" />
            <div className="core-ring core-ring-three" />

            <div className="core-center">
              <span>AI</span>
              <small>
                {isRunning
                  ? 'ACTIVE'
                  : isCompleted
                    ? 'READY'
                    : 'STANDBY'}
              </small>
            </div>

          </div>


          <div className="agent-console">

            <div className="console-header">

              <span>
                AGENT EVENT STREAM
              </span>

              <span className="console-live">
                ● LIVE
              </span>

            </div>

            <div className="console-body">

              <p>
                <span>&gt;</span>
                ResolveAI agent initialized
              </p>

              <p>
                <span>&gt;</span>
                Knowledge retrieval engine ready
              </p>

              <p>
                <span>&gt;</span>
                Gemini reasoning engine ready
              </p>

              {isRunning && (
                <p className="console-active">
                  <span>&gt;</span>
                  Executing stage {activeStage + 1}...
                </p>
              )}

              {isCompleted && (
                <p className="console-success">
                  <span>&gt;</span>
                  Autonomous workflow completed successfully
                </p>
              )}

              {!isRunning && !isCompleted && (
                <p className="console-muted">
                  <span>&gt;</span>
                  Awaiting incident execution...
                </p>
              )}

            </div>

          </div>


          <div className="agent-actions">

            {!isRunning && !isCompleted && (
              <button
                className="agent-primary-btn"
                onClick={startAgent}
              >
                <span>✦</span>
                Start Agent Simulation
              </button>
            )}

            {isRunning && (
              <button
                className="agent-primary-btn agent-running-btn"
                disabled
              >
                <span className="button-spinner" />
                Agent Processing...
              </button>
            )}

            {isCompleted && (
              <button
                className="agent-secondary-btn"
                onClick={resetAgent}
              >
                ↻ Run Again
              </button>
            )}

          </div>

        </div>

      </section>


      {/* ================================================
          AGENT CAPABILITIES
      ================================================ */}

      <section className="agent-capabilities">

        <div className="capability-card">
          <span className="capability-number">
            01
          </span>

          <div>
            <strong>
              Context Retrieval
            </strong>

            <p>
              Retrieves relevant troubleshooting knowledge
              before reasoning about the incident.
            </p>
          </div>
        </div>


        <div className="capability-card">
          <span className="capability-number">
            02
          </span>

          <div>
            <strong>
              Autonomous Reasoning
            </strong>

            <p>
              Uses incident symptoms and retrieved context
              to determine the probable technical cause.
            </p>
          </div>
        </div>


        <div className="capability-card">
          <span className="capability-number">
            03
          </span>

          <div>
            <strong>
              Resolution Planning
            </strong>

            <p>
              Converts AI reasoning into practical,
              actionable troubleshooting steps.
            </p>
          </div>
        </div>


        <div className="capability-card">
          <span className="capability-number">
            04
          </span>

          <div>
            <strong>
              Human Confirmation
            </strong>

            <p>
              Keeps humans in control of final ticket
              resolution and closure.
            </p>
          </div>
        </div>

      </section>

    </main>
  )
}