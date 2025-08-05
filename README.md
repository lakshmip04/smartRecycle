SmartRecycle - Solution for Sustainable Development
🎯 Project Overview
SDG Challenge Addressed
SDG 11: Sustainable Cities and Communities & SDG 12: Responsible Consumption and Production

This project addresses SDG 11 by creating a smarter, more efficient urban waste management system. By connecting households directly with specialized collectors and optimizing collection routes, we reduce the carbon footprint of waste transport and help prevent unmanaged waste from polluting urban environments.

Furthermore, it directly supports SDG 12 by promoting responsible consumption patterns. The platform's incentive system, AI-powered 3R chatbot, and waste classification tools educate and encourage users to segregate waste properly, increasing recycling rates and fostering a circular economy within the community.

Our Solution
SmartRecycle - An AI-Powered Waste Management Platform

SmartRecycle is a full-stack, cloud-native web application that connects three key user groups: household users who need to dispose of waste, waste collectors who manage pickups, and administrators who oversee the system. It uses AI to classify waste, provide recycling recommendations, and optimize collection routes, creating an efficient and incentivized ecosystem for urban waste management.

Impact Statement
Target Beneficiaries: The initial rollout targets household users and informal waste collectors in Hyderabad, with the potential to scale to other metropolitan areas.

Expected Outcomes:

30% increase in the rate of correctly segregated recyclable waste.

25% reduction in fuel consumption and time for collectors due to route optimization.

Provide a stable, digitized platform for informal collectors to find work and increase their income.

Measurable Impact Metrics:

Total weight (in kg) of waste collected per category.

Number of successful pickups completed.

User engagement with the AI chatbot and classifier.

Collector earnings and number of jobs completed.

Long-term Sustainability Vision: To partner with local municipalities (like the GHMC) to integrate our platform into official city-wide waste management operations, creating a formal, data-driven system that benefits both citizens and the environment.

⚙️ Technical Implementation
Technology Stack
Category

Technologies

Purpose

AI/ML

Google Gemini 1.5 Flash

AI-powered waste classification from images and the 3R recommendation chatbot.

Backend

Next.js API Routes

Serverless functions for all backend logic, authentication, and database operations.

Frontend

Next.js, React, Material-UI (MUI)

A fully responsive, modern user interface for all three user dashboards.

Cloud Platform

Vercel, Supabase

Vercel for serverless hosting and deployment; Supabase for the PostgreSQL database and file storage.

Mapping

Leaflet, Google Maps Directions API

Displaying collector/job locations and calculating optimized multi-stop routes.

Databases

PostgreSQL (via Supabase)

Primary data storage for users, alerts, incentives, etc.

ORM

Prisma

Type-safe database access and schema management.

Visuals

Framer Motion, TSParticles, Recharts

Animations, background effects, and data visualization for analytics.

System Architecture
SmartRecycle is built on a modern, serverless architecture. The frontend (Next.js/React) is deployed on Vercel, which also hosts the backend API routes. These API routes use a single, managed Prisma client to communicate securely with the Supabase PostgreSQL database. File uploads (for user images and collector IDs) are handled by the Supabase Storage client. This entire system is designed to be highly scalable and cost-effective.

SmartRecycle - Solution for Sustainable Development
Table of Contents
🎯 Project Overview

SDG Challenge Addressed

Our Solution

Impact Statement

⚙️ Technical Implementation

Technology Stack

Architecture Overview

Cloud-Native Integration

🚀 Solution Components

Working Prototype

Technical Documentation

Impact Analysis

📖 Getting Started

Prerequisites

Installation

Usage

🤝 Contributing

👥 Contributors

🙏 Acknowledgments

🎯 Project Overview
SDG Challenge Addressed
🎯 SDG 11: Sustainable Cities and Communities & SDG 12: Responsible Consumption and Production

This project addresses SDG 11 by creating a smarter, more efficient urban waste management system. By connecting households directly with specialized collectors and optimizing collection routes, we reduce the carbon footprint of waste transport and help prevent unmanaged waste from polluting urban environments.

Furthermore, it directly supports SDG 12 by promoting responsible consumption patterns. The platform's incentive system, AI-powered 3R chatbot, and waste classification tools educate and encourage users to segregate waste properly, increasing recycling rates and fostering a circular economy within the community.

Our Solution
🚀 SmartRecycle - An AI-Powered Waste Management Platform

SmartRecycle is a full-stack, cloud-native web application that connects three key user groups: household users who need to dispose of waste, waste collectors who manage pickups, and administrators who oversee the system. It uses AI to classify waste, provide recycling recommendations, and optimize collection routes, creating an efficient and incentivized ecosystem for urban waste management.

Impact Statement
🎯 Target Beneficiaries: The initial rollout targets household users and informal waste collectors in Hyderabad, with the potential to scale to other metropolitan areas.

📊 Expected Outcomes:

30% increase in the rate of correctly segregated recyclable waste.

25% reduction in fuel consumption and time for collectors due to route optimization.

Provide a stable, digitized platform for informal collectors to find work and increase their income.

📈 Measurable Impact Metrics:

Total weight (in kg) of waste collected per category.

Number of successful pickups completed.

User engagement with the AI chatbot and classifier.

Collector earnings and number of jobs completed.

🌱 Long-term Sustainability Vision: To partner with local municipalities (like the GHMC) to integrate our platform into official city-wide waste management operations, creating a formal, data-driven system that benefits both citizens and the environment.

⚙️ Technical Implementation
Technology Stack
Category

Technologies

Purpose

🤖 AI/ML

Google Gemini 1.5 Flash

AI-powered waste classification from images and the 3R recommendation chatbot.

🌐 Backend

Next.js API Routes

Serverless functions for all backend logic, authentication, and database operations.

⚡ Frontend

Next.js, React, Material-UI (MUI)

A fully responsive, modern user interface for all three user dashboards.

☁️ Cloud Platform

Vercel, Supabase

Vercel for serverless hosting and deployment; Supabase for the PostgreSQL database and file storage.

🗺️ Mapping

Leaflet, Google Maps Directions API

Displaying collector/job locations and calculating optimized multi-stop routes.

📊 Databases

PostgreSQL (via Supabase)

Primary data storage for users, alerts, incentives, etc.

🛠️ ORM

Prisma

Type-safe database access and schema management.

✨ Visuals

Framer Motion, TSParticles, Recharts

Animations, background effects, and data visualization for analytics.

Architecture Overview
🖥️ User Interface Layer

Web Application: A fully responsive web application built with Next.js and React, styled with Material-UI.

User Authentication: Frontend login/register forms communicate with backend API routes. User session data and roles are stored securely in localStorage.

Responsive Design: The UI is designed to work seamlessly on mobile, tablet, and desktop devices using MUI's Grid system and responsive hooks.

⚡ API Gateway & Services

RESTful APIs: All backend logic is exposed through RESTful API endpoints built with Next.js API Routes.

Monolithic Architecture: The application follows a monolithic architecture, which is appropriate for this stage. All services (auth, alerts, admin) are part of the same Next.js application.

Load Balancing: Handled automatically by Vercel's serverless infrastructure, which scales on demand.

🧠 Processing & AI Layer

Machine Learning Models: Utilizes the Google Gemini 1.5 Flash model for both the 3R recommendation chatbot and the image-based waste classifier.

Data Processing Pipelines: The admin analytics API (/api/admin/analytics) performs real-time aggregation and processing of database data to generate insights for the charts.

💾 Data Storage & Management

Primary Database: A PostgreSQL database hosted and managed by Supabase.

Database Access: Prisma serves as the Object-Relational Mapper (ORM) for safe and efficient database queries.

File Storage: Supabase Storage is used for storing user-uploaded files, such as collector identity documents and images of waste.

Backup and Recovery: Handled automatically by the Supabase platform.

🔗 External Integrations

Google Gemini API: For all AI-powered features.

Google Maps Directions API: For calculating optimized multi-stop routes for collectors.

Supabase API: For database and file storage services.

Cloud-Native Integration
Our solution is "born in the cloud" and leverages modern, serverless technologies, which aligns with CNCF principles even without directly managing orchestration.

CNCF Category

Tools & Technologies

Implementation

🐳 Container Runtime

Managed by Vercel

Vercel uses containerization (like Docker) behind the scenes to build and deploy the application in an isolated, consistent environment.

☸️ Orchestration

Managed by Vercel

We do not use Kubernetes directly. Vercel's serverless platform automatically handles the orchestration, scaling, and management of our API functions.

🚀 CI/CD

Vercel's Git Integration

Continuous integration and deployment are handled automatically. Every git push to the main branch triggers a new build and deployment on Vercel.

💾 Storage

Supabase Storage

Provides a scalable, cloud-native solution for object storage (user-uploaded files).

📊 Observability

Vercel Analytics

Vercel's built-in dashboard provides real-time monitoring, logs, and performance insights for the deployed application.

🚀 Solution Components
Working Prototype
🌐 Live Demo: https://smartrecycle-web.vercel.app/

📱 Demo Credentials:

# Admin User
Email: admin@smartrecycle.com
Password: adminpassword

# You can register new Household and Collector users on the site.

✅ Core Functionality:

Role-based authentication for Household, Collector, and Admin users.

Full CRUD (Create, Read, Update, Delete) functionality for waste alerts.

Incentive system managed by the admin and displayed to users.

Interactive map for collectors to view and claim jobs.

AI-powered waste classifier and 3R recommendation chatbot.

Advanced analytics dashboard for the admin.

🎨 User Interface: A clean, responsive, and animated UI built with Material-UI and Framer Motion.

⚡ Performance: Fast page loads and API responses thanks to Next.js's server-side rendering and Vercel's serverless architecture.

Technical Documentation
Document Type

Description

Link

🏗️ System Architecture

Detailed technical design

Architecture Doc

📡 API Documentation

All endpoints and integrations

API Docs

🚀 Deployment Guide

Step-by-step setup instructions

Deploy Guide

Impact Analysis
Quantitative Metrics
📈 User Adoption: Seeded with 100 household users and 66 specialized collectors for a realistic demo.

⏱️ Efficiency Gains: The route optimization feature is designed to reduce travel time for collectors by up to 25%.

💰 Cost Savings: The incentive system encourages proper segregation, which can lower processing costs for municipal waste services.

Qualitative Benefits
🌱 Environment: Directly encourages recycling and proper waste disposal, reducing landfill waste and pollution.

👥 Social: Provides a digital platform for informal waste collectors to find work more efficiently and safely, potentially increasing their income.

🎓 Education: The AI chatbot and waste guide educate users on the importance of the 3Rs (Reduce, Reuse, Recycle).

📖 Getting Started
Prerequisites
🛠️ Required Software:

# Node.js
node --version  # v18.0.0 or higher

# npm (comes with Node.js)
npm --version   # 9.0.0 or higher

🔧 Development Tools:

Git (for version control)

VS Code or your preferred IDE

A Supabase account (for the database)

A Google Cloud Platform account (for the Maps API key)

Installation
🚀 Quick Start (10 minutes):

📥 Clone the Repository

git clone [YOUR_REPOSITORY_URL]
cd smartrecycle-web

📦 Install Dependencies

npm install

⚙️ Environment Configuration

Create a .env file in the root of the project for your database URLs.

Create a .env.local file for your Supabase and Google Maps keys.

Fill in the values as described in the deployment guide.

🗄️ Database Setup

# Sync your Prisma schema with your Supabase database
npx prisma db push

# Seed the database with initial data (admin, users, collectors, incentives)
npx prisma db seed

🎉 Start the Application

# Run the development server
npm run dev

Usage
🌐 Accessing the Application:

Environment

URL

Purpose

Local Development

http://localhost:3000

Development and testing

Production

https://smartrecycle-web.vercel.app/

Live application

🤝 Contributing
We welcome contributions! Please see our CONTRIBUTING.md for more details on how to get involved.

👥 Contributors
Kandibanda Lohith
Lakshmi Priya P
Hridyalakshmi Santhosh

🙏 Acknowledgments
The organizers of the hackathon for this opportunity.

The open-source community for the amazing tools and libraries used in this project.
