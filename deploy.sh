#!/bin/bash
npm run build && \
aws s3 sync dist/ s3://lt-assistant-frontend --delete && \
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"