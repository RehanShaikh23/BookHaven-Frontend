# BookHaven - Online Bookstore

## Project Overview
BookHaven is a full-stack online bookstore application that allows users to browse, search, purchase books, and manage their book collections. The platform supports both buyers and sellers.

## Key Features

### User Authentication
- User registration with email verification
- Secure login/logout functionality
- JWT-based authentication
- Protected routes for authenticated users

### Book Browsing & Search
- Browse all available books
- Search books by title, author, or category
- Filter books by categories
- View detailed book information
- Book ratings and reviews

### Shopping Cart & Checkout
- Add books to cart
- Update quantities
- Remove items from cart
- View order summary
- Checkout process

### User Dashboard
- View user profile
- Order history
- Account statistics
- Manage personal information

### Seller Features
- Add new books for sale
- Edit existing book listings
- Delete book listings
- View "My Books" collection
- Upload book images

### Additional Features
- Newsletter subscription via EmailJS
- Responsive design for all devices
- Lazy loading for performance optimization
- Modern UI with TailwindCSS
- Loading states and error handling

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS, Styled Components
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Email Service**: EmailJS

## User Roles
1. **Guest Users**: Can browse books, view details
2. **Registered Users**: Can purchase books, manage cart, view dashboard
3. **Sellers**: Can add/edit/delete their book listings

## Pages
1. Home - Landing page with featured books
2. Books - Catalog with search and filters
3. Book Detail - Individual book information
4. Login - User authentication
5. Register - User registration
6. Cart - Shopping cart management
7. Dashboard - User profile and statistics
8. My Books - Seller's book management
9. Add/Edit Book - Book listing form
