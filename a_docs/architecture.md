# Architecture Documentation

## Table of Contents
1. [Overall Architecture](#overall-architecture)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)

---

## Overall Architecture

### System Overview

```mermaid
graph TB
    User["👤 User/Browser"]

    subgraph "Client Layer"
        FE["React Frontend<br/>(React 19.2.4)"]
        Firebase_Auth["Firebase Auth<br/>(Client SDK)"]
    end

    subgraph "API Layer"
        LB["API Gateway<br/>(Cloud Run)"]
        API["FastAPI Backend<br/>(Python)"]
    end

    subgraph "Data & Services Layer"
        Firestore["Firestore<br/>(Cloud Database)"]
        Cache["Redis Cache<br/>(Optional)"]
    end

    User -->|HTTPS| FE
    FE -->|Sign In/Out| Firebase_Auth
    Firebase_Auth -->|ID Token| API
    FE -->|REST API<br/>with Auth| LB
    LB --> API
    API -->|Query/Write| Firestore
    API -->|Cache<br/>Operations| Cache

    style User fill:#e1f5ff
    style FE fill:#fff3e0
    style Firebase_Auth fill:#f3e5f5
    style API fill:#e8f5e9
    style Firestore fill:#fce4ec
    style Cache fill:#f1f8e9
    style LB fill:#ede7f6
```

### Data Flow - User Journey

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Firebase as Firebase Auth
    participant FastAPI as FastAPI Backend
    participant Firestore as Firestore DB

    User->>React: 1. Visit Website
    React->>Firebase: 2. Check Auth Status

    alt User Not Logged In
        User->>React: 3. Click Login
        React->>Firebase: 4. Authenticate (Email/Password/Google)
        Firebase->>React: 5. Return ID Token
    end

    React->>FastAPI: 6. API Request + ID Token
    FastAPI->>Firebase: 7. Verify Token
    FastAPI->>Firestore: 8. Query Data
    Firestore->>FastAPI: 9. Return Data
    FastAPI->>React: 10. Return API Response
    React->>User: 11. Display Content
```

---

## Backend Architecture

### Backend System Design

```mermaid
graph TB
    subgraph "Entry Point"
        Main["main.py<br/>(FastAPI App)"]
    end

    subgraph "Middleware Layer"
        CORS["CORS Middleware"]
        Logging["Logging Middleware"]
        Auth["Auth Verification"]
    end

    subgraph "Routes/Controllers"
        AuthRouter["auth.py<br/>- Login<br/>- Signup<br/>- Logout"]
        ProductsRouter["products.py<br/>- List Products<br/>- Get Details"]
        CartRouter["cart.py<br/>- Add to Cart<br/>- Remove Item<br/>- Get Cart"]
        OrdersRouter["orders.py<br/>- Create Order<br/>- Get Orders<br/>- Order Status"]
    end

    subgraph "Models Layer"
        UserModel["User Model"]
        ProductModel["Product Model"]
        CartModel["Cart Model"]
        OrderModel["Order Model"]
    end

    subgraph "Business Logic"
        Utils["utils/"]
        Cache["cache.py"]
        Config["config.py"]
    end

    subgraph "Data Layer"
        Firestore_SDK["firestore.py<br/>(DB Service)"]
        Firestore_DB["☁️ Firestore<br/>Collections:<br/>- users<br/>- products<br/>- carts<br/>- orders"]
    end

    subgraph "External Services"
        Firebase_Admin["Firebase Admin SDK"]
    end

    Main --> CORS
    Main --> Logging
    Main --> Auth

    CORS --> AuthRouter
    CORS --> ProductsRouter
    CORS --> CartRouter
    CORS --> OrdersRouter

    AuthRouter --> UserModel
    ProductsRouter --> ProductModel
    CartRouter --> CartModel
    OrdersRouter --> OrderModel

    AuthRouter --> Firebase_Admin
    AuthRouter --> Utils

    ProductsRouter --> Cache
    CartRouter --> Firestore_SDK
    OrdersRouter --> Firestore_SDK

    Firestore_SDK --> Firestore_DB

    Config -.->|Config Settings| Main

    style Main fill:#c8e6c9
    style AuthRouter fill:#fff9c4
    style ProductsRouter fill:#ffccbc
    style CartRouter fill:#f8bbd0
    style OrdersRouter fill:#b2dfdb
    style Firestore_DB fill:#fce4ec
    style Firebase_Admin fill:#f3e5f5
```

### Backend Request Flow

```mermaid
graph LR
    Request["HTTP Request<br/>+ Auth Token"]

    Request -->|1. Receive| CORS["CORS Check<br/>✓ Allowed Origins"]

    CORS -->|2. Process| Logging["Log Request<br/>- Method, Path<br/>- Headers"]

    Logging -->|3. Verify| AuthCheck["Firebase Token<br/>Verification"]

    AuthCheck -->|4. Route| Router["Route to Handler<br/>- /auth<br/>- /products<br/>- /cart<br/>- /orders"]

    Router -->|5. Process| Handler["Route Handler<br/>Business Logic"]

    Handler -->|6. Access| DB["Firestore Query<br/>or Cache Hit"]

    DB -->|7. Return| Handler

    Handler -->|8. Build| Response["JSON Response<br/>+ Status Code"]

    Response -->|9. Return| Client["Client<br/>React App"]

    style Request fill:#e3f2fd
    style CORS fill:#f1f8e9
    style AuthCheck fill:#f3e5f5
    style Handler fill:#fff3e0
    style Client fill:#fce4ec
```

### Backend File Structure

```mermaid
graph TD
    Backend["backend/"]

    Backend --> Main_py["main.py"]
    Backend --> Config["config.py"]
    Backend --> Firestore_py["firestore.py"]
    Backend --> Cache_py["cache.py"]
    Backend --> Dockerfile["Dockerfile"]
    Backend --> Requirements["requirements.txt"]

    Backend --> Middleware["middleware/"]
    Middleware --> Log_MW["logging.py"]

    Backend --> Models["models/"]
    Models --> User_Model["user.py"]
    Models --> Product_Model["product.py"]
    Models --> Cart_Model["cart.py"]
    Models --> Order_Model["order.py"]

    Backend --> Routes["routes/"]
    Routes --> Auth["auth.py"]
    Routes --> Products["products.py"]
    Routes --> Cart["cart.py"]
    Routes --> Orders["orders.py"]

    Backend --> Utils["utils/"]
    Utils --> Logger["logger.py"]
    Utils --> Helpers["helpers.py"]

    Backend --> Tests["tests/"]
    Tests --> Unit_Tests["unit/"]
    Tests --> Integration["integration/"]

    style Backend fill:#c8e6c9
    style Routes fill:#fff9c4
    style Models fill:#ffccbc
    style Utils fill:#b2dfdb
    style Tests fill:#f8bbd0
```

---

## Frontend Architecture

### Frontend Component Architecture

```mermaid
graph TB
    subgraph "App Shell"
        App["App.js<br/>(Main Component)"]
        Router["React Router<br/>- Home<br/>- Products<br/>- Cart<br/>- Orders"]
    end

    subgraph "Pages/Screens"
        Home["Home Page"]
        Products["Products Page"]
        CartPage["Shopping Cart"]
        Orders["Orders Page"]
        Auth["Auth Page<br/>Login/Signup"]
    end

    subgraph "Components"
        Header["Header<br/>- Logo<br/>- Nav<br/>- User Menu"]
        ProductCard["ProductCard<br/>- Image<br/>- Price<br/>- Add to Cart"]
        CartItem["CartItem<br/>- Remove Btn<br/>- Qty Selector"]
        OrderCard["OrderCard<br/>- Status<br/>- Details"]
    end

    subgraph "State Management"
        AuthContext["AuthContext<br/>- Current User<br/>- Auth State"]
        CartContext["CartContext<br/>- Cart Items<br/>- Total Price"]
    end

    subgraph "Services Layer"
        Firebase_SDK["Firebase SDK<br/>- Auth Service"]
        API_Client["API Client<br/>- Fetch Requests<br/>- Error Handling"]
    end

    subgraph "Styling"
        CSS["Global Styles<br/>- index.css<br/>- App.css"]
    end

    subgraph "Utilities"
        Utils["utils/<br/>- Helpers<br/>- Constants"]
        Firebase_Config["firebase/<br/>config.js"]
    end

    App --> Router
    Router --> Home
    Router --> Products
    Router --> CartPage
    Router --> Orders
    Router --> Auth

    Home --> Header
    Products --> ProductCard
    CartPage --> CartItem
    Orders --> OrderCard

    ProductCard --> API_Client
    CartItem --> CartContext
    Auth --> Firebase_SDK

    Header --> AuthContext
    Products --> CartContext

    CartContext --> API_Client
    Firebase_SDK --> API_Client

    API_Client --> Utils
    Firebase_Config --> Firebase_SDK

    CSS -.->|Styling| App

    style App fill:#fff3e0
    style Header fill:#f1f8e9
    style ProductCard fill:#ffccbc
    style CartItem fill:#f8bbd0
    style AuthContext fill:#f3e5f5
    style CartContext fill:#e1f5ff
    style Firebase_SDK fill:#fce4ec
    style API_Client fill:#e8f5e9
```

### Frontend Data Flow

```mermaid
graph LR
    User["User Action<br/>e.g., Click 'Add to Cart'"]

    User -->|1. Dispatch| Action["Action Triggered<br/>in Component"]

    Action -->|2. Update| Context["Context State<br/>AuthContext/<br/>CartContext"]

    Context -->|3. Call| API["API Call<br/>via API Client"]

    API -->|4. Include| Token["Auth Token<br/>from AuthContext"]

    Token -->|5. Send| Backend["Backend API<br/>FastAPI"]

    Backend -->|6. Return| Response["Response<br/>Success/Error"]

    Response -->|7. Update| ContextUpdate["Update Context<br/>with New Data"]

    ContextUpdate -->|8. Re-render| Component["Component<br/>Re-renders<br/>with New Data"]

    Component -->|9. Display| UI["UI Updated<br/>User Sees Changes"]

    style User fill:#fff3e0
    style Action fill:#e3f2fd
    style Context fill:#f3e5f5
    style API fill:#e8f5e9
    style Token fill:#fce4ec
    style Component fill:#c8e6c9
```

### Frontend File Structure

```mermaid
graph TD
    Frontend["src/"]

    Frontend --> Index["index.js"]
    Frontend --> App_js["App.js"]
    Frontend --> CSS["index.css<br/>App.css"]

    Frontend --> Components["components/<br/>Reusable UI"]
    Components --> Header["Header.js"]
    Components --> ProductCard["ProductCard.js"]
    Components --> CartItem["CartItem.js"]
    Components --> OrderCard["OrderCard.js"]
    Components --> NavBar["NavBar.js"]
    Components --> Footer["Footer.js"]

    Frontend --> Context["context/<br/>State Mgmt"]
    Context --> AuthCtx["AuthContext.js"]
    Context --> CartCtx["CartContext.js"]

    Frontend --> Firebase_Dir["firebase/"]
    Firebase_Dir --> Config["config.js"]
    Firebase_Dir --> Auth_Service["auth.js"]

    Frontend --> Utils["utils/"]
    Utils --> Constants["constants.js"]
    Utils --> Helpers["helpers.js"]
    Utils --> API["api.js"]

    Frontend --> Styles["styles/"]
    Styles --> Global["global.css"]
    Styles --> Variables["variables.css"]

    Frontend --> Tests["__tests__/"]

    style Frontend fill:#fff3e0
    style Components fill:#ffccbc
    style Context fill:#f3e5f5
    style Utils fill:#b2dfdb
    style Firebase_Dir fill:#fce4ec
```

### Component Hierarchy

```mermaid
graph TD
    App["&lt;App /&gt;"]

    App --> Router["&lt;Router /&gt;"]

    Router --> Pages["Pages"]
    Pages --> Home_Page["&lt;HomePage /&gt;"]
    Pages --> Products_Page["&lt;ProductsPage /&gt;"]
    Pages --> Cart_Page["&lt;CartPage /&gt;"]
    Pages --> Orders_Page["&lt;OrdersPage /&gt;"]
    Pages --> Auth_Page["&lt;AuthPage /&gt;"]

    Home_Page --> Header1["&lt;Header /&gt;"]
    Home_Page --> HeroSection["&lt;HeroSection /&gt;"]

    Products_Page --> Header2["&lt;Header /&gt;"]
    Products_Page --> ProductGrid["&lt;ProductGrid /&gt;"]
    ProductGrid --> PC1["&lt;ProductCard /&gt;"]
    ProductGrid --> PC2["&lt;ProductCard /&gt;"]
    ProductGrid --> PC3["&lt;ProductCard /&gt;"]

    Cart_Page --> Header3["&lt;Header /&gt;"]
    Cart_Page --> CartList["&lt;CartList /&gt;"]
    CartList --> CI1["&lt;CartItem /&gt;"]
    CartList --> CI2["&lt;CartItem /&gt;"]
    Cart_Page --> CartSummary["&lt;CartSummary /&gt;"]

    Orders_Page --> Header4["&lt;Header /&gt;"]
    Orders_Page --> OrdersList["&lt;OrdersList /&gt;"]
    OrdersList --> OC1["&lt;OrderCard /&gt;"]

    Header1 --> NavBar["&lt;NavBar /&gt;"]
    Header1 --> UserMenu["&lt;UserMenu /&gt;"]

    style App fill:#fff3e0
    style Router fill:#e3f2fd
    style Header1 fill:#f1f8e9
    style Header2 fill:#f1f8e9
    style ProductCard fill:#ffccbc
    style CartItem fill:#f8bbd0
