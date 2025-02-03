# API Server Documentation

This API server provides endpoints for processing requests related to business acquisition theses, fetching business matches, and generating recommendations.

## Routes

### POST `/startRequest`

Starts processing a request for business acquisition theses.

**Request Body:**

-   `professionHistory`: string - A list of professions the user has worked in.
-   `competencies`: string - A list of user's skills and competencies.
-   `negativeCompetencies`: string - A list of user's weaknesses and dislikes.
-   `hobbies`: string - A list of user's likes, interests, and hobbies.
-   `previousAcquisitions`: string - A list of user's current businesses (if any).

**Response:**

-   `token`: string - A unique token for tracking the request status.

### GET `/endRequest/:token`

Checks the status of a request and returns the result if completed.

**Path Parameters:**

-   `token`: string - The unique token for the request.

**Response:**

-   `response`: object - The parsed content of the theses.
-   `error`: string (optional) - An error message if the request failed.

### GET `/queryRequest/:token`

Queries the status of a request.

**Path Parameters:**

-   `token`: string - The unique token for the request.

**Response:**

-   `progress`: number - The progress of the request (0 for processing, 1 for completed).
-   `status`: string - The status of the request (processing, completed, or error).
-   `error`: string (optional) - An error message if the request failed.

### POST `/startApolloMatchBusinesses`

Starts processing a request for matching businesses based on a thesis.

**Request Body:**

-   `thesis`: string - The business acquisition thesis.
-   `me`: string - The relevance of the thesis to the user.
-   `trends`: string - The trends and economic environment related to the thesis.

**Response:**

-   `token`: string - A unique token for tracking the request status.

### POST `/startApolloRecommends`

Starts processing a request for generating recommendations.

**Request Body:**

-   `thesis`: string - The business acquisition thesis.
-   `business`: string - The business to analyze.

**Response:**

-   `token`: string - A unique token for tracking the request status.

### GET `/apolloMatchBusinessesSync`

Processes a request for matching businesses based on a thesis synchronously.

**Query Parameters:**

-   `thesis`: string - The business acquisition thesis.
-   `me`: string - The relevance of the thesis to the user.
-   `trends`: string - The trends and economic environment related to the thesis.

**Response:**

-   `results`: array - A list of matching businesses with metadata.
-   `error`: string (optional) - An error message if the request failed.

## Authentication Endpoints

### Login

-   **URL:** `/auth/login`
-   **Method:** `POST`
-   **Request body:**
    -   email: string (required)
    -   password: string (required)

### Register

-   **URL:** `/auth/register`
-   **Method:** `POST`
-   **Request headers:**
    -   DEAL-REG-API-KEY: string (required)
-   **Request body:**
    -   firstName: string (required)
    -   lastName: string (required)
    -   email: string (required)
    -   password: string (required)

### Logout

-   **URL:** `/api/auth/logout`
-   **Method:** `POST`
-   **Request headers:**
    -   Authorization: Bearer [JWT] (required)

