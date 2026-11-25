
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Store,
  ChevronDown,
  Menu,
} from "lucide-react";
import "./Header.css";

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-top">
        <button
          className="brand"
          onClick={() => onNavigate("home")}
        >
          NEXORA<span>.</span>
        </button>

        <div className="header-search">
          <input
            type="search"
            placeholder="Search products, brands and stores..."
          />
          <button aria-label="Search">
            <Search size={21} />
          </button>
        </div>

        <div
          className="account-area"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className={`account-trigger ${menuOpen ? "active" : ""}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Store size={20} />
            <span>
              <small>Hello, Seller</small>
              <strong>Account & Profile</strong>
            </span>
            <ChevronDown size={15} />
          </button>

          {menuOpen && (
            <div
              className="mega-menu-bridge"
              onMouseEnter={() => setMenuOpen(true)}
            >
              <div className="mega-menu">
                <div className="mega-menu-top">
                  <div className="seller-avatar">N</div>
                  <div>
                    <strong>Welcome to NEXORA</strong>
                    <p>Manage your marketplace account</p>
                  </div>
                  <button
                    className="profile-button"
                    onClick={() => {
                      onNavigate("seller-profile");
                      setMenuOpen(false);
                    }}
                  >
                    Your Profile
                  </button>
                </div>

                <div className="mega-menu-columns">
                  <div className="menu-column">
                    <h4>Your Business</h4>
                    <button onClick={() => onNavigate("seller-profile")}>
                      Seller Profile
                    </button>
                    <button onClick={() => onNavigate("seller-profile")}>
                      Store Settings
                    </button>
                    <button onClick={() => onNavigate("seller-profile")}>
                      Business Information
                    </button>
                    <button onClick={() => onNavigate("seller-profile")}>
                      Verification Center
                    </button>
                  </div>

                  <div className="menu-column">
                    <h4>Your Selling</h4>
                    <button onClick={() => onNavigate("products")}>
                      Products
                    </button>
                    <button onClick={() => onNavigate("inventory")}>
                      Inventory
                    </button>
                    <button onClick={() => onNavigate("orders")}>
                      Orders
                    </button>
                    <button onClick={() => onNavigate("returns")}>
                      Returns & Refunds
                    </button>
                  </div>

                  <div className="menu-column">
                    <h4>Finance</h4>
                    <button onClick={() => onNavigate("payments")}>
                      Payments
                    </button>
                    <button onClick={() => onNavigate("payouts")}>
                      Payouts
                    </button>
                    <button onClick={() => onNavigate("transactions")}>
                      Transactions
                    </button>
                  </div>

                  <div className="menu-column">
                    <h4>Account</h4>
                    <button onClick={() => onNavigate("security")}>
                      Security
                    </button>
                    <button onClick={() => onNavigate("notifications")}>
                      Notifications
                    </button>
                    <button onClick={() => onNavigate("settings")}>
                      Account Settings
                    </button>
                  </div>
                </div>

                <div className="mega-menu-bottom">
                  <span>Need assistance?</span>
                  <button onClick={() => onNavigate("support")}>
                    Seller Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="cart-button">
          <ShoppingCart size={23} />
          <span>Cart</span>
        </button>
      </div>

      <nav className="header-nav">
        <button className="all-menu">
          <Menu size={18} /> All Categories
        </button>
        <button>Today's Deals</button>
        <button>New Arrivals</button>
        <button>Best Sellers</button>
        <button>Global Brands</button>
      </nav>
    </header>
  );
}
