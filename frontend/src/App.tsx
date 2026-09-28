import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { CartProvider } from "./lib/cart";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Orders from "./pages/Orders";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <TopNav />
          <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
