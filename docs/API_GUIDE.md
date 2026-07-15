# Backend API Gateway Documentation 🔌

This document outlines the API specifications, request payloads, response structures, and security controls for StadiumPulse AI.

---

## 🛠️ Base Configurations

All requests must set:
- **Header**: `Content-Type: application/json`
- **Rate Limit**: Max 100 requests per 15 minutes per IP.

---

## 🚀 Endpoints

### 1. Multilingual Chat Concierge
Returns natural conversation assistance for fans. Auto-detects input language.

- **URL**: `/api/chat`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "message": "Where is Gate D?",
    "history": [
      { "sender": "user", "text": "Hello" },
      { "sender": "assistant", "text": "Welcome to StadiumPulse AI!" }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "reply": "Gate D is located on the West side of the stadium. It is fully ADA-accessible and closest to Parking Zone D.",
    "detectedLanguage": "en"
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  {
    "error": "Security alert: Your input matches patterns associated with prompt injection or unsafe commands. Request blocked.",
    "securityAlert": true
  }
  ```

---

### 2. Tactical Operations Incident Decision Support
Generates prioritised tactical action steps for operations coordinators.

- **URL**: `/api/decision-support`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "situation": "Unusual crowd bottleneck at North Gate Gate A due to transit delays."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "recommendations": [
      {
        "rank": 1,
        "action": "Reroute transit shuttles to East Gate Gate C",
        "reasoning": "Shedding volume from North gate reduces density instantly. Gate C currently has excess capacity."
      }
    ]
  }
  ```

---

### 3. Broadcaster Translation Hub
Broadcasts an English announcement instantly across five key World Cup languages.

- **URL**: `/api/broadcast`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "originalText": "Please use Gate C to enter the stadium, Gate B is temporarily congested."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "translations": {
      "en": "Please use Gate C to enter the stadium, Gate B is temporarily congested.",
      "es": "Por favor, diríjase a la Puerta C para ingresar más rápido. La Puerta B está actualmente congestionada.",
      "fr": "Veuillez vous diriger vers la porte C pour une entrée plus rapide. La porte B est actuellement encombrée.",
      "ar": "يرجى التوجه إلى البوابة C لتسهيل الدخول. البوابة B مزدحمة حالياً.",
      "hi": "कृपया तेजी से प्रवेश के लिए गेट सी की ओर जाएं। गेट बी वर्तमान में व्यस्त है।",
      "pt": "Por favor, dirija-se ao Portão C para entrada mais rápida. O Portão B está congestionado."
    }
  }
  ```
