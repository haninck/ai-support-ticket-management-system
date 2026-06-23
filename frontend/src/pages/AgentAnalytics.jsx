import "../styles/AgentAnalytics.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AgentAnalytics() {

  const [agents, setAgents] =
    useState([]);

  const navigate =
    useNavigate();

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    axios
      .get(
        "http://127.0.0.1:5000/api/agent_analytics",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )
      .then((response) => {

        setAgents(
          response.data
        );

      })
      .catch((error) => {

        console.error(error);

      });

  }, []);

  const totalAssigned =
    agents.reduce(
      (total, agent) =>
        total +
        Number(
          agent.total_assigned
        ),
      0
    );

  const totalResolved =
    agents.reduce(
      (total, agent) =>
        total +
        Number(
          agent.resolved_count
        ),
      0
    );

  const totalOpen =
    agents.reduce(
      (total, agent) =>
        total +
        Number(
          agent.open_count
        ),
      0
    );

  const avgRate =
    totalAssigned > 0
      ? Math.round(
          (
            totalResolved /
            totalAssigned
          ) * 100
        )
      : 0;

  const validAgents =
    agents.filter(
      (agent) =>
        agent.avg_resolution_time &&
        agent.avg_resolution_time !== "-"
    );

  let avgResolutionTime = "-";

  if (validAgents.length > 0) {

    let totalMinutes = 0;

    validAgents.forEach(
      (agent) => {

        const match =
          agent.avg_resolution_time.match(
            /(\d+)h\s+(\d+)m/
          );

        if (match) {

          const hours =
            Number(match[1]);

          const minutes =
            Number(match[2]);

          totalMinutes +=
            (hours * 60) +
            minutes;

        }

      }
    );

    const averageMinutes =
      Math.round(
        totalMinutes /
        validAgents.length
      );

    const avgHours =
      Math.floor(
        averageMinutes / 60
      );

    const avgMins =
      averageMinutes % 60;

    avgResolutionTime =
      `${avgHours}h ${avgMins}m`;

  }

  return (

    <div className="analytics-page">

      <div className="analytics-header">

        <h1>
          📈 Agent Analytics
        </h1>

        <p>
          Performance Overview
        </p>

      </div>

      <div className="analytics-actions">

        <button
          className="back-dashboard-btn"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          ← Dashboard
        </button>

      </div>

      <div className="analytics-stats">

        <div className="analytics-stat-card">

          <h3>
            Total Assigned
          </h3>

          <p>
            {totalAssigned}
          </p>

        </div>

        <div className="analytics-stat-card">

          <h3>
            Total Resolved
          </h3>

          <p>
            {totalResolved}
          </p>

        </div>

        <div className="analytics-stat-card">

          <h3>
            Open Tickets
          </h3>

          <p>
            {totalOpen}
          </p>

        </div>

        <div className="analytics-stat-card">

          <h3>
            Avg Resolution Rate
          </h3>

          <p>
            {avgRate}%
          </p>

        </div>

        <div className="analytics-stat-card">

          <h3>
            Avg Resolution Time
          </h3>

          <p>
            {avgResolutionTime}
          </p>

        </div>

      </div>

      <div className="analytics-table-card">

        <h2>
          Agent Performance Overview
        </h2>

        <table
          className="analytics-table"
        >

          <thead>

            <tr>

              <th>
                Agent
              </th>

              <th>
                Assigned
              </th>

              <th>
                Resolved
              </th>

              <th>
                Open
              </th>

              <th>
                Resolution Rate
              </th>

              <th>
                Avg Time
              </th>

            </tr>

          </thead>

          <tbody>

            {agents.map(
              (agent) => {

                const assigned =
                  Number(
                    agent.total_assigned
                  );

                const resolved =
                  Number(
                    agent.resolved_count
                  );

                const open =
                  Number(
                    agent.open_count
                  );

                const rate =
                  assigned > 0
                    ? Math.round(
                        (
                          resolved /
                          assigned
                        ) * 100
                      )
                    : 0;

                return (

                  <tr
                    key={
                      agent.assigned_to
                    }
                  >

                    <td>
                      {
                        agent.assigned_to
                      }
                    </td>

                    <td>
                      {assigned}
                    </td>

                    <td>
                      {resolved}
                    </td>

                    <td>
                      {open}
                    </td>

                    <td>

                      <div
                        className="rate-wrapper"
                      >

                        <div
                          className="rate-bar"
                        >

                          <div
                            className="rate-fill"
                            style={{
                              width:
                                `${rate}%`
                            }}
                          />

                        </div>

                        <span>
                          {rate}%
                        </span>

                      </div>

                    </td>

                    <td
                      className="avg-time"
                    >

                      {
                        agent.avg_resolution_time
                      }

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default AgentAnalytics;