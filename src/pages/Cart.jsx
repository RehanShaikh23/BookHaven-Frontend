import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  X,
} from "lucide-react";
import { useBooks } from "../contexts/BookContext";
import { useAuth } from "../contexts/AuthContext";

const Cart = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    checkout,
    clearCart,
    loading,
    error: contextError,
  } = useBooks();
  const { isAuthenticated, validateToken } = useAuth();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    estimatedDelivery: "",
  });
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (contextError || localError) {
      const timeout = setTimeout(() => {
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [contextError, localError]);

  // Close modal on Escape for better UX
  useEffect(() => {
    if (!showSuccessModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowSuccessModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSuccessModal]);

  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  const { total, subtotal, shipping, tax } = useMemo(() => {
    const subtotal =
      typeof cartTotal === "number" ? cartTotal : parseFloat(cartTotal) || 0;
    const shipping = subtotal >= 25 ? 0 : 4.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { total, subtotal, shipping, tax };
  }, [cart, cartTotal]);

  const handleQuantityChange = async (bookId, newQty) => {
    try {
      const book = cart.find((item) => item.id === bookId);
      if (!book) return;

      if (newQty <= 0) {
        await removeFromCart(bookId);
      } else {
        await updateCartQuantity(bookId, newQty);
      }
    } catch (err) {
      setLocalError("Failed to update cart. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }

    try {
      const tokenIsValid = await validateToken();
      if (!tokenIsValid) {
        setLocalError("Session expired. Please log in again.");
        return;
      }

      const result = await checkout();
      if (result.success) {
        const {
          orderId = "BH-" + Date.now().toString().slice(-8),
          estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        } = result.data || {};
        setOrderDetails({ orderId, estimatedDelivery });
        setShowSuccessModal(true);
      } else {
        setLocalError(result.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      setLocalError("Checkout failed: " + (err.message || "An error occurred"));
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  if (cart.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-8" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your cart is empty.
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover our collection of amazing books to find your next
              favorite read!
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
              aria-label="Browse books"
            >
              <span>Browse Books</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>

            {/* Suggested Books Placeholder */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Explore Popular Genres
              </h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {[
                  "Fiction",
                  "Classic Literature",
                  "Dystopian Fiction",
                  "Romance",
                ].map((genre) => (
                  <Link
                    key={genre}
                    to={`/books?genre=${genre}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-x-3 mb-6">
            <p className="text-red-700 text-sm">{localError}</p>
            <button
              onClick={() => setLocalError(null)}
              className="text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex p-6">
                  {/* Book Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Book Details */}
                  <div className="ml-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/books/${item.id}`}
                          className="text-lg font-serif font-semibold text-gray-900 hover:text-blue-700 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-gray-600 mt-1">{item.author}</p>
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {item.genre}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        aria-label={`Remove ${item.title} from cart`}
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-x-3">
                        <span className="text-gray-700 font-medium">
                          Quantity:
                        </span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                            aria-label={`Decrease quantity of ${item.title}`}
                            disabled={loading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                            aria-label={`Increase quantity of ${item.title}`}
                            disabled={loading || !item.inStock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-gray-500 text-sm">
                          ${item.price.toFixed(2)} each
                        </div>
                        <div className="text-xl font-bold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="text-right">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear all items from your cart?"
                    )
                  ) {
                    clearCart();
                  }
                }}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                aria-label="Clear all items from cart"
              >
                Clear all items
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal (
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span className="font-medium text-gray-800">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-800">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>

                {/* Free Shipping Message */}
                {subtotal < 25 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      Add ${(25 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Proceed to checkout"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>

              {/* Continue Shopping */}
              <Link
                to="/books"
                className="block w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium text-center transition-colors"
                aria-label="Continue shopping"
              >
                Continue Shopping
              </Link>

              {/* Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-success-title"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
                  aria-label="Close order confirmation"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h2
                  id="order-success-title"
                  className="text-2xl font-serif font-bold text-white mb-2"
                >
                  Order Confirmed!
                </h2>
                <p className="text-green-100">Thank you for your purchase</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Order Details */}
                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orderDetails.orderId}
                    </p>
                  </div>
                  <p className="text-gray-600">
                    Your order has been successfully placed and is being
                    processed.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Estimated Delivery
                      </h4>
                      <p className="text-sm text-gray-600">
                        {orderDetails.estimatedDelivery
                          ? new Date(
                              orderDetails.estimatedDelivery
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Within 5-7 business days"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>
                      {shipping === 0
                        ? "Free shipping included"
                        : "Standard shipping"}
                    </span>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">What's Next?</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Order confirmation email sent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Processing your order</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Shipping notification coming soon</span>
                    </div>
                  </div>
                </div>

                
                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {/* Close (just closes modal) */}
                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>

                  {/* Finalize Order (clear cart + go to dashboard) */}
                  <button
                    onClick={() => {
                      clearCart();
                      navigate("/dashboard");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Finalize Order
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
