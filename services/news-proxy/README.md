# MatchPulse News Proxy (Cloudflare Worker)

An isolated Cloudflare Worker that securely proxies and normalizes football news from the [GNews API](https://gnews.io) for the MatchPulse mobile application.

## Architecture & Security

- **Secret Isolation**: Upstream `GNEWS_API_KEY` is stored as an encrypted Cloudflare Worker secret and read at runtime via `env.GNEWS_API_KEY`. It is never bundled, exposed to clients, logged, or placed in URL query strings.
- **Header Authentication**: Authenticates with GNews using the `X-Api-Key` HTTP header.
- **Fixed Query Parameters**: Enforces a strict, fixed query (`q=football OR soccer&lang=en&max=10&in=title,description&sortby=publishedAt`). Client-specified search terms, arbitrary endpoints, or target URLs are rejected.
- **Response Caching**: Responses are cached using Cloudflare's `caches.default` for ~30 minutes (`max-age=1800, s-maxage=1800`), conserving the Free tier quota across mobile app refreshes.
- **Content Sanitization**: Validates required fields (`title`, `url`, `publishedAt`), restricts URLs to `http:`/`https:`, and returns short summary snippets (no full article scraping).

## Provider Plan Limits (GNews Free Tier)

This integration is configured for the **GNews Free Plan** (portfolio / non-commercial usage):

| Parameter | Limit / Policy |
| :--- | :--- |
| **Request Quota** | 100 requests per day |
| **Article Freshness** | **12-hour delay** (not breaking / real-time news) |
| **Max Articles** | 10 articles per request |
| **Archive Window** | Last 30 days |
| **Commercial Use** | Non-commercial evaluation only |

## API Endpoints

### 1. `GET /health`
Returns service availability status without revealing credentials or configuration.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "matchpulse-news-proxy"
}
```

### 2. `GET /api/news`
Fetches and returns the latest cached football news articles.

**Response (200 OK):**
```json
{
  "articles": [
    {
      "id": "c621e25e791b86e088a2c20cf35a12ef",
      "title": "Champions League round-up: Key moments and tactical analysis",
      "source": "Sky Sports",
      "publishedAt": "2026-10-25T20:15:00.000Z",
      "summary": "A concise overview of the latest European matchday action...",
      "url": "https://www.skysports.com/football/news/...",
      "imageUrl": "https://e0.365dm.com/..."
    }
  ]
}
```

**Error Status Codes:**
- `405 Method Not Allowed`: Request method is not `GET` or `OPTIONS`.
- `429 Too Many Requests`: Upstream GNews request quota reached (100 req/day).
- `500 Internal Server Error`: Worker is missing the required `GNEWS_API_KEY` secret.
- `502 Bad Gateway`: Upstream GNews authentication error, connection failure, or malformed data.

## Local Development

1. **Install dependencies**:
   ```bash
   cd services/news-proxy
   npm install
   ```

2. **Configure local secret**:
   Create a `.dev.vars` file (automatically ignored by git):
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Add your GNews API key:
   ```env
   GNEWS_API_KEY=your_actual_gnews_api_key
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   The worker starts on `http://localhost:8787`.

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Typecheck**:
   ```bash
   npm run typecheck
   ```

## Production Deployment

1. **Authenticate with Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Set the GNews API Key Secret**:
   ```bash
   npx wrangler secret put GNEWS_API_KEY
   ```
   Enter your key when prompted.

3. **Deploy the Worker**:
   ```bash
   npm run deploy
   ```
   Cloudflare outputs your public endpoint, e.g.:
   `https://matchpulse-news-proxy.<your-subdomain>.workers.dev`

4. **Connect MatchPulse Mobile App**:
   In the root `matchpulse/.env` file, configure:
   ```env
   EXPO_PUBLIC_NEWS_PROXY_URL=https://matchpulse-news-proxy.<your-subdomain>.workers.dev
   ```
