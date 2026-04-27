# NYC-DELIVERY-OPTIMIZER

## 🚨 Deployment Notice

The current live deployment on :contentReference[oaicite:0]{index=0} (nyc-delivery-route-optimizer.vercel.app) does not fully reflect the Google Maps functionality of this project.

The complete version is available in the :contentReference[oaicite:1]{index=1} repository.

---

## 🧠 Issue

The deployed version is missing Google Maps integration due to:
- Missing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Google Maps / Directions APIs not enabled in production

As a result:
- Map rendering is not working
- Route visualization is not displayed

---

## 🛠️ Run Full Version Locally

```bash
git clone https://github.com/Khushnew/NYC-DELIVERY-ROUTE-OPTIMIZER
cd NYC-DELIVERY-ROUTE-OPTIMIZER
npm install
npm run dev
<img width="389" height="465" alt="Screenshot 2026-02-25 at 6 24 02 AM" src="https://github.com/user-attachments/assets/9ced3d93-e969-4462-8bbd-7fa75fc8f448" />
