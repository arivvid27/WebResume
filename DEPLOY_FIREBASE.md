# Firebase Deployment Instructions

1. Install Firebase CLI (if not already):
   npm install -g firebase-tools

2. Login to Firebase:
   firebase login

3. Initialize Firebase in this project folder:
   firebase init hosting
   # - Use 'html' as the public directory
   # - Configure as a single-page app (rewrite all to /index.html)
   # - Do NOT overwrite your existing index.html

4. Build your CSS (if using Sass):
   npx sass scss/index.scss html/index.css --no-source-map

5. Deploy:
   firebase deploy

---

- Your site will be live at the URL provided by Firebase after deploy.
- You can update by repeating steps 4 and 5.
