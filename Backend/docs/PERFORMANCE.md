# Performance

API list endpoints use bounded pagination. SQLAlchemy queries use indexed filter/order fields defined by the canonical schema. API responses are GZip-compressed when larger than 1 KB. Image uploads are resized to configured dimensions and JPEG-optimized with Pillow.

PageSpeed is not an API-only metric. Final 90–100 scores depend on the Next.js bundle, images/CDN, fonts, caching, layout shift, and network conditions.
