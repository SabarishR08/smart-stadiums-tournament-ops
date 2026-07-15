# Production Deployment Guide 🚀

This document provides complete instructions to build, package, and deploy StadiumPulse AI to production on **Google Cloud Run** or general cloud container clusters.

---

## 🏗️ Prerequisites

Ensure you have the following installed:
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://www.docker.com/)

---

## 🐳 Step 1: Containerize the Application Locally

1. **Test the Docker Build**:
   ```bash
   docker build -t gcr.io/your-project-id/stadium-pulse:v1.0 .
   ```

2. **Verify locally**:
   ```bash
   docker run -p 3000:3000 \
     -e GEMINI_API_KEY="your-gemini-key" \
     gcr.io/your-project-id/stadium-pulse:v1.0
   ```
   Open `http://localhost:3000` to verify correct operation.

---

## ☁️ Step 2: Push to Google Container Registry (GCR)

1. **Authenticate the Docker daemon with GCP**:
   ```bash
   gcloud auth configure-docker
   ```

2. **Push the image to your repository**:
   ```bash
   docker push gcr.io/your-project-id/stadium-pulse:v1.0
   ```

---

## 🏃 Step 3: Deploy to Google Cloud Run

Deploy your container to Cloud Run using the `gcloud` command line:

```bash
gcloud run deploy stadium-pulse-app \
  --image gcr.io/your-project-id/stadium-pulse:v1.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="GEMINI_API_KEY=your_actual_key_here,NODE_ENV=production"
```

### Key Flags:
- `--allow-unauthenticated`: Enables public ingress web traffic.
- `--port 3000`: Commands ingress routing to forward directly to our Node.js container port.
- `--set-env-vars`: Securely passes operational secret variables to the instance environment.
