export default function Settings({
  backendStatus,
}) {

  return (

    <main className="main-content">

      <div className="advanced-page-header">

        <div>

          <span className="card-eyebrow">
            PLATFORM
          </span>

          <h2>
            Settings
          </h2>

          <p>
            Configure ResolveAI platform and AI operations.
          </p>

        </div>

      </div>


      <section className="settings-page-card">

        <div className="settings-page-section">

          <div>

            <strong>
              AI Incident Analysis
            </strong>

            <p>
              Enable autonomous AI analysis of IT incidents.
            </p>

          </div>

          <span className="setting-status active">
            Enabled
          </span>

        </div>


        <div className="settings-page-section">

          <div>

            <strong>
              Knowledge Retrieval
            </strong>

            <p>
              Use the ResolveAI knowledge base during analysis.
            </p>

          </div>

          <span className="setting-status active">
            Enabled
          </span>

        </div>


        <div className="settings-page-section">

          <div>

            <strong>
              Backend Connection
            </strong>

            <p>
              FastAPI service connection status.
            </p>

          </div>

          <span
            className={
              `setting-status ${
                backendStatus === 'online'
                  ? 'active'
                  : 'inactive'
              }`
            }
          >

            {backendStatus === 'online'
              ? 'Connected'
              : 'Unavailable'
            }

          </span>

        </div>

      </section>

    </main>

  )

}