# Local
## backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8080

## frontend
cd frontend
npm start

## Test
curl http://localhost:8080/health
open http://localhost:8080/docs
curl http://localhost:8080/products

## Run all tests
pytest tests/ -v


## Docker build

docker build -t ecommerce-backend:latest .

## Docker Run

docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID=test-99u1b3 \
  -v $(pwd)/service-account.json:/app/service-account.json \
  ecommerce-backend:latest

