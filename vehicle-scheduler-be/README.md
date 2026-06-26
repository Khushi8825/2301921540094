# Vehicle Maintenance Scheduler Microservice

A production-ready backend microservice that optimizes daily vehicle maintenance scheduling across multiple depots using the **0/1 Knapsack Dynamic Programming algorithm**. This project was developed as part of the **AffordMed Campus Hiring Evaluation**.

The service fetches depot and vehicle information from the protected AffordMed APIs, determines the optimal set of maintenance tasks for each depot within the available mechanic-hour budget, and maximizes the total operational impact.

---

# Features

* Depot Data Integration
* Vehicle Data Integration
* JWT/Bearer Token Authentication
* 0/1 Knapsack Optimization
* Dynamic Programming Solution
* AffordMed Logging Middleware Integration
* Modular Project Structure
* RESTful APIs
* Error Handling & Validation
* Environment-based Configuration

---

# Problem Statement

Each depot has a limited number of mechanic hours available for a day.

Each vehicle maintenance request contains:

* Task ID
* Estimated Duration (Hours)
* Operational Impact Score

The objective is to select a subset of maintenance tasks such that:

* Total maintenance duration does not exceed the depot's available mechanic hours.
* Total operational impact is maximized.

---

# Tech Stack

## Backend

* Node.js
* Express.js
* JavaScript (ES Modules)
* Axios
* Dotenv

## Algorithms

* Dynamic Programming
* 0/1 Knapsack Algorithm

## Logging

* AffordMed Logging Middleware

---

# Project Structure

```text
vehicle-scheduler-be/

├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── algorithms/
│   ├── utils/
│   ├── logger/
│   ├── app.js
│   └── server.js
│
├── screenshots/
├── .env
├── package.json
├── README.md
└── output.json
```

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd vehicle-scheduler-be
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000

AFFORDMED_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
DEPOT_API=http://4.224.186.213/evaluation-service/depots
VEHICLES_API=http://4.224.186.213/evaluation-service/vehicles
```

---

# Running the Project

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

# API Workflow

1. Authenticate using the AffordMed Bearer Token.
2. Fetch depot information from the Depot API.
3. Fetch vehicle maintenance requests from the Vehicles API.
4. Group vehicles based on their respective depots.
5. Apply the 0/1 Knapsack algorithm for each depot.
6. Generate the optimal maintenance schedule.
7. Return the selected Task IDs along with scheduling details.

---

# Optimization Algorithm

The scheduling logic is implemented using the **0/1 Knapsack Dynamic Programming** algorithm.

For each depot:

* Capacity = Available Mechanic Hours
* Weight = Maintenance Duration
* Value = Operational Impact

The algorithm computes the optimal combination of maintenance tasks while ensuring the mechanic-hour constraint is satisfied.

### Time Complexity

```text
O(N × H)
```

Where:

* **N** = Number of maintenance tasks
* **H** = Available mechanic hours

---

# Logging

This project integrates the custom **AffordMed Logging Middleware**.

Logging includes:

* Incoming Requests
* API Responses
* External API Calls
* Scheduling Operations
* Algorithm Execution
* Validation Errors
* Unexpected Exceptions

---

# Output

The service generates an optimized maintenance schedule containing:

* Depot ID
* Available Mechanic Hours
* Selected Task IDs
* Total Scheduled Duration
* Total Operational Impact

---

# Screenshots

The `screenshots/` directory contains:

* Successful API responses
* Scheduler execution output
* Postman testing results

These screenshots demonstrate that the backend is functioning correctly.

---

# Error Handling

The application gracefully handles:

* Invalid Access Tokens
* External API Failures
* Network Errors
* Invalid Request Data
* Unexpected Server Errors

---

# Future Improvements

* Parallel Depot Processing
* Redis Caching
* Background Queue Processing
* Scheduling Analytics
* Maintenance Priority Levels
* Real-Time Dashboard
* API Documentation with Swagger

---

---

