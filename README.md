# Digital Health Platform - Backend

This is the backend service for the Digital Health Platform, a healthcare solution designed to improve access to medical services in rural Rwanda. It provides API endpoints for user authentication, doctor availability, booking, and health monitoring tools.

## Features

- **User Management** - Secure authentication and role-based access for users and healthcare providers.
- **Doctor Availability & Booking** - Endpoints to fetch available doctors and schedule virtual consultations.
- **Health Monitoring API** - Allows users to track key health indicators.
- **Notifications** - Sends alerts for vaccinations, health checkups, and appointment reminders.

## Tech Stack

- **NestJS** - A scalable Node.js framework for building efficient APIs.
- **PostgreSQL** - A powerful open-source relational database for data storage.
- **TypeORM** - An ORM for managing database interactions.

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (v16 or later)
- PostgreSQL

### Steps to Set Up

1. **Clone the repository:**
   ```sh
   git clone https://github.com/gloriaumutoni/AccessCare-Backend.git
   cd AccessCare-Backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure the following:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/accesscare
   JWT_SECRET=your_jwt_secret
   ```

4. **Run database migrations:**
   ```sh
   npm run typeorm migration:run
   ```

5. **Start the backend server:**
   ```sh
   npm run start
   ```

The backend will be available at `http://localhost:3000` by default.
