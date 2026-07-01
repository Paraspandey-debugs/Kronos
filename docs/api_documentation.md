# Kronos Distributed System - API Documentation

This document outlines the available HTTP endpoints for the three microservices in the Kronos ecosystem.

---

## 1. Gateway API (`kronos-gateway.onrender.com`)

The Gateway is the primary entry point for the Kronos system. It exposes the main REST API used by clients to trigger workflows and monitor system health.

**Base URL:** `https://kronos-gateway.onrender.com/api/v1`

### 1.1 Health Check
Used to verify that the Gateway service is online and responding.

* **Method:** `GET`
* **Path:** `/health`
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-06-25T07:02:09.852Z"
  }
  ```

### 1.2 Create Workflow
Submits a new workflow to the system. The payload is validated against the schema before being saved to the database and queued for execution.

* **Method:** `POST`
* **Path:** `/workflows`
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Example Workflow",
    "steps": [
      {
        "agentType": "SCRAPER",
        "payload": {
          "url": "https://example.com"
        }
      },
      {
        "agentType": "ANALYZER",
        "payload": {
          "data": "$step_0.result"
        }
      }
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "status": "WORKFLOW_QUEUED",
    "workflowId": "uuid-string-here"
  }
  ```
* **Response (400 Bad Request):**
  Returned if the payload fails validation (e.g., missing fields, invalid agentType).

### 1.3 List Workflows
Retrieves a paginated list of workflow executions.

* **Method:** `GET`
* **Path:** `/workflows`
* **Query Parameters:**
  * `status` (optional): Filter by workflow status (e.g., PENDING, COMPLETED, FAILED).
  * `take` (optional): Number of records to return.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid-string-here",
      "name": "Example Workflow",
      "status": "COMPLETED",
      "createdAt": "2026-06-25T07:15:00.000Z"
    }
  ]
  ```

### 1.4 List Flows (Visual DAGs)
Retrieves all visual workflows (Flows) created by the authenticated user.

* **Method:** `GET`
* **Path:** `/flows`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid-string-here",
      "name": "My Web Scraper Flow",
      "createdAt": "2026-06-25T07:15:00.000Z"
    }
  ]
  ```

### 1.5 Get Flow
Retrieves the complete configuration (nodes and edges) for a specific flow.

* **Method:** `GET`
* **Path:** `/flows/:id`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "id": "uuid-string-here",
    "name": "My Web Scraper Flow",
    "nodes": [...],
    "edges": [...]
  }
  ```

### 1.6 Create Flow
Saves a new visual workflow created via the DAG editor.

* **Method:** `POST`
* **Path:** `/flows`
* **Headers:** 
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "New Flow",
    "nodes": [...],
    "edges": [...]
  }
  ```
* **Response (201 Created):** Returns the created flow object with its new `id`.

### 1.7 Update Flow
Updates an existing flow's nodes and edges.

* **Method:** `PUT`
* **Path:** `/flows/:id`
* **Headers:** 
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Updated Flow Name",
    "nodes": [...],
    "edges": [...]
  }
  ```
* **Response (200 OK):** Returns the updated flow object.

### 1.8 Run Flow
Compiles a visual flow into a workflow execution and queues it for Engine A.

* **Method:** `POST`
* **Path:** `/flows/:id/run`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "status": "WORKFLOW_QUEUED",
    "workflowId": "uuid-string-here"
  }
  ```

### 1.9 Get Agent Templates
Retrieves the dynamic configuration schemas for all available nodes/agents in the system, used to render the editor UI.

* **Method:** `GET`
* **Path:** `/agents/templates`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
    {
      "type": "scout",
      "label": "Scout",
      "description": "Data fetching",
      "icon": "Search",
      "color": "n-blue",
      "configSchema": { ... },
      "outputSchema": { ... }
    }
  ]
  ```

---

## 2. Engine A / Orchestrator (`kronos-enginea.onrender.com`)

Engine A is a background worker responsible for orchestrating the workflow steps. It does not expose functional REST APIs for task manipulation; however, it does expose a health check endpoint for uptime monitoring.

**Base URL:** `https://kronos-enginea.onrender.com`

### 2.1 Health Check
Used by Render and external uptime monitors to ensure the Engine A process is alive.

* **Method:** `GET`
* **Path:** `/health`
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "orchestrator",
    "timestamp": "2026-06-25T07:15:00.000Z"
  }
  ```

---

## 3. Engine B / Worker (`kronos-engineb.onrender.com`)

Engine B is a background worker responsible for executing individual tasks (e.g., scraping, analyzing). Like Engine A, it does not expose REST APIs for tasks, only a health check endpoint.

**Base URL:** `https://kronos-engineb.onrender.com`

### 3.1 Health Check
Used by Render and external uptime monitors to ensure the Engine B process is alive.

* **Method:** `GET`
* **Path:** `/health`
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "worker",
    "timestamp": "2026-06-25T07:15:00.000Z"
  }
  ```
