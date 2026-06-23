import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/tickets.css";
function Tickets() {
  
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTickets, setSelectedTickets] =
  useState([]);
  const [deleteMode, setDeleteMode] =
  useState(false);
  const username =
  localStorage.getItem(
    "username"
  );

const role =
  localStorage.getItem(
    "role"
  );
  useEffect(() => {

  const token =
    localStorage.getItem("token");

  axios.get(
    "http://127.0.0.1:5000/api/tickets",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then((response) => {

    setTickets(
      response.data
    );

  })
  .catch((error) => {

    console.error(
      "Error fetching tickets:",
      error
    );

  });

}, []);
  const visibleTickets =

  role === "admin"

    ? tickets

    : tickets.filter(
        (ticket) =>
          ticket.assigned_to === username
      );
  const filteredTickets = visibleTickets.filter((ticket) => {

  const matchesSearch =

    (ticket.ticket_text || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    (ticket.category || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    (ticket.priority || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    (ticket.status || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    (ticket.id || "")
  .toString()
  .includes(search)

||

(ticket.created_by || "")
  .toLowerCase()
  .includes(search.toLowerCase())

||

(ticket.assigned_to || "")
  .toLowerCase()
  .includes(search.toLowerCase());

  const matchesStatus =

    statusFilter === "All"
      ? true
      : ticket.status === statusFilter;

  return matchesSearch && matchesStatus;

});
const addToDataset = (ticketId) => {

  const token =
    localStorage.getItem("token");

  axios
    .post(
      "http://127.0.0.1:5000/api/add_to_dataset",
      {
        ticket_id: ticketId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => {

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                added_to_dataset: "Yes"
              }
            : ticket
        )
      );

    })
    .catch((error) => {

      console.error(error);

    });

};
const updateStatus = (ticketId, newStatus) => {

  const token =
    localStorage.getItem("token");

  axios
    .post(
      "http://127.0.0.1:5000/api/update_status",
      {
        ticket_id: ticketId,
        status: newStatus
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => {

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus
              }
            : ticket
        )
      );

    })
    .catch((error) => {

      console.error(error);

    });

};
const deleteSelectedTickets = () => {

  if (selectedTickets.length === 0) {

    alert(
      "Please select tickets first"
    );

    return;
  }

  const token =
    localStorage.getItem("token");

  axios
    .post(
      "http://127.0.0.1:5000/api/delete_selected",
      {
        ticket_ids: selectedTickets
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => {

      setTickets(
        tickets.filter(
          (ticket) =>
            !selectedTickets.includes(
              ticket.id
            )
        )
      );

      setSelectedTickets([]);

      setDeleteMode(false);

      alert(
        "Tickets deleted successfully"
      );

    })
    .catch((error) => {

      console.error(error);

      alert(
        "Failed to delete tickets"
      );

    });

};
const exportExcel = () => {

  const token =
    localStorage.getItem("token");

  axios.get(
    "http://127.0.0.1:5000/api/export_excel",
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: "blob"
    }
  )
  .then((response) => {

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "tickets.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  })
  .catch((error) => {

    console.error(error);

  });

};
  return (

    <div className="container tickets-page">

      <div className="result-card">

        <div className="result-header">
          <h2>📋 Ticket History</h2>
        </div>
        <div className="search-container">

  <input
    className="search-box"
    type="text"
    placeholder="Search by ID, Category, Priority, Status, Username or agent"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

</div>

<br/>
<div className="filter-buttons">

  <button
    className={`filter-btn filter-all ${
      statusFilter === "All" ? "is-active" : ""
    }`}
    onClick={() => setStatusFilter("All")}
  >
    All
  </button>

  <button
    className={`filter-btn filter-open ${
      statusFilter === "Open" ? "is-active" : ""
    }`}
    onClick={() => setStatusFilter("Open")}
  >
    Open
  </button>

  <button
    className={`filter-btn filter-progress ${
      statusFilter === "In Progress" ? "is-active" : ""
    }`}
    onClick={() => setStatusFilter("In Progress")}
  >
    In Progress
  </button>

  <button
    className={`filter-btn filter-resolved ${
      statusFilter === "Resolved" ? "is-active" : ""
    }`}
    onClick={() => setStatusFilter("Resolved")}
  >
    Resolved
  </button>

  <button
    className={`filter-btn filter-closed ${
      statusFilter === "Closed" ? "is-active" : ""
    }`}
    onClick={() => setStatusFilter("Closed")}
  >
    Closed
  </button>

</div>
<div className="action-bar">

  {role === "admin" && (

  !deleteMode ? (

    <button
      className="delete-selected-btn"
      onClick={() =>
        setDeleteMode(true)
      }
    >
      Delete Tickets
    </button>

  ) : (

    <>

      <button
        className="delete-selected-btn"
        onClick={deleteSelectedTickets}
      >
        Delete Selected
      </button>

      <button
        className="filter-btn cancel-btn"
        onClick={() => {

          setDeleteMode(false);

          setSelectedTickets([]);

        }}
      >
        Cancel
      </button>

    </>

  )

)}
  <button
    className="export-btn"
    onClick={exportExcel}
  >
    Export Excel
  </button>
<Link to="/dashboard">

  <button className="dashboard-return-btn">
    ⇐ Dashboard
  </button>

</Link>
</div>
<br />

        <div className="tickets-table-wrap">

        <table className="ticket-table">

          <thead>

            <tr>
              {
               deleteMode && (
               <th>Select</th>
              )
              }
              <th>ID</th>
              <th>Created</th>
              <th className="ticket-col">
                 Ticket
              </th>
              <th>Assigned To</th>
              <th>Category</th>
              <th>Confidence</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Dataset</th>
            </tr>

          </thead>

          <tbody>

           


   {filteredTickets.map((ticket) => (

    <tr key={ticket.id}>
      {
  deleteMode && (

    <td>

      <input
        type="checkbox"
        checked={
          selectedTickets.includes(
            ticket.id
          )
        }
        onChange={(e) => {

          if (e.target.checked) {

            setSelectedTickets([
              ...selectedTickets,
              ticket.id
            ]);

          } else {

            setSelectedTickets(
              selectedTickets.filter(
                (id) =>
                  id !== ticket.id
              )
            );

          }

        }}
      />

    </td>

  )
}
                 <td>
                     <Link
                     to={`/ticket/${ticket.id}`}
                     className="ticket-id-btn"
                    >
                    {ticket.id}
                </Link>
                </td>
                <td>

                  {ticket.creation_date ||
                   ticket.date_of_creation ||
                   "-"}

                </td>
<td className="ticket-col">

  <div className="ticket-hover">

    <span className="ticket-short">

      {ticket.ticket_text.length > 15
        ? ticket.ticket_text.substring(0, 15) + "..."
        : ticket.ticket_text}

    </span>

    <div className="ticket-popup">

      {ticket.ticket_text}

    </div>

  </div>

</td>

<td className="assigned-col">

  {ticket.assigned_to || "Unassigned"}

</td>

<td>

  {ticket.category}

</td>

<td>

  {ticket.confidence}%

</td>

<td>

  {ticket.priority}

</td>

<td>

  <select

    className={`status-dropdown ${
      ticket.status === "Open"
        ? "status-open"
        : ticket.status === "In Progress"
        ? "status-progress"
        : ticket.status === "Resolved"
        ? "status-resolved"
        : "status-closed"
    }`}

    value={ticket.status}

    onChange={(e) =>
      updateStatus(
        ticket.id,
        e.target.value
      )
    }

  >

    <option value="Open">
      Open
    </option>

    <option value="In Progress">
      In Progress
    </option>

    <option value="Resolved">
      Resolved
    </option>

    <option value="Closed">
      Closed
    </option>

  </select>

</td>

<td>

  {ticket.added_to_dataset === "Yes" ? (

    <button
      className="dataset-btn"
      disabled
    >
      Added ✓
    </button>

  ) : (

    <button
      className="dataset-btn"
      onClick={() =>
        addToDataset(ticket.id)
      }
    >
      Add
    </button>

  )}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

);

}

export default Tickets;
