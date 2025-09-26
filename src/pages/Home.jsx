import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Truck, Shield, Award } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import LazyBookCard from '../components/LazyBookCard';

const Home = () => {
  const { books } = useBooks();
  const featuredBooks = books.slice(0, 3);
  const topRatedBooks = books.sort((a, b) => b.rating - a.rating).slice(0, 3);

  const features = [
    {
      icon: BookOpen,
      title: 'Vast Collection',
      description: 'Over 10,000 books across all genres and categories'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $25, delivered within 3-5 days'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your privacy and security are our top priorities'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: '30-day return policy and quality assurance on all books'
    }
  ];

  // Stats data configured for count-up animation
  const stats = [
    { icon: BookOpen, target: 10000, label: 'Books Available', suffix: '+', decimals: 0 },
    { icon: Users, target: 50000, label: 'Happy Customers', suffix: '+', decimals: 0 },
    { icon: Star, target: 4.8, label: 'Average Rating', suffix: '/5', decimals: 1 },
    { icon: Truck, target: 99, label: 'On-Time Delivery', suffix: '%', decimals: 0 }
  ];

  // CountUp component
  const CountUp = ({ target, duration = 1500, suffix = '', decimals = 0, start = false }) => {
    const [value, setValue] = useState(0);
    const startRef = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => {
      if (!start) return;
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = target * eased;
        setValue(current);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [start, target, duration]);

    const formatted = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);

    return <span>{formatted}{suffix}</span>;
  };

  // Trigger count-up when stats section enters viewport
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    if (!statsRef.current || statsInView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsInView(true);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsInView]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-coffee-800 via-coffee-700 to-coffee-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight">
                Welcome to
                <span className="text-coffee-200 block">BookHaven</span>
              </h1>
              <p className="text-xl text-coffee-100 leading-relaxed max-w-2xl">
                Discover your next favorite book from our carefully curated collection. 
                From timeless classics to contemporary bestsellers, we have something for every reader.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/books"
                  className="bg-coffee-600 hover:bg-coffee-500 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Browse Books</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-coffee-300 hover:bg-coffee-300 hover:text-coffee-900 text-coffee-100 px-8 py-4 rounded-xl font-semibold text-lg text-center transition-all duration-300"
                >
                  Join Now
                </Link>
              </div>
            </div>
            <div className="hidden lg:block animate-fade-in">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg"
                  alt="Books"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/50 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-coffee-900 mb-4">
              Why Choose BookHaven?
            </h2>
            <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
              We're committed to providing the best book shopping experience with unmatched service and quality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-cream hover:bg-coffee-50 transition-all duration-300 ease-out group transform hover:-translate-y-1 hover:shadow-xl hover:-rotate-[0.5deg] ring-1 ring-transparent hover:ring-2 hover:ring-coffee-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-600 text-white rounded-full mb-6 group-hover:bg-coffee-700 transition-all duration-300 transform group-hover:scale-110">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-coffee-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-coffee-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-coffee-400 to-coffee-600 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-coffee-900 mb-4">
                Featured Books
              </h2>
              <p className="text-xl text-coffee-600">
                Handpicked selections from our collection
              </p>
            </div>
            <Link
              to="/books"
              className="hidden md:flex items-center space-x-2 text-coffee-600 hover:text-coffee-800 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredBooks.map((book) => (
              <LazyBookCard key={book.id} book={book} />
            ))}
          </div>
          <div className="text-center md:hidden">
            <Link
              to="/books"
              className="inline-flex items-center space-x-2 bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span>View All Books</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Rated Books Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-coffee-900 mb-4">
              Top Rated Books
            </h2>
            <p className="text-xl text-coffee-600">
              Discover the books our readers love most
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topRatedBooks.map((book) => (
              <LazyBookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-coffee-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">
              BookHaven in Numbers
            </h2>
            <p className="text-xl text-coffee-200">
              Join thousands of satisfied readers worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-transform duration-700 ${statsInView ? 'animate-fade-in' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-700 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-coffee-200" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  <CountUp
                    target={stat.target}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    start={statsInView}
                  />
                </div>
                <div className="text-coffee-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-coffee-600 to-coffee-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-coffee-100 mb-8 leading-relaxed">
            Join our community of book lovers and discover your next favorite read. 
            Create your account today and get access to exclusive offers and recommendations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-white text-coffee-800 hover:bg-coffee-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/books"
              className="border-2 border-white hover:bg-white hover:text-coffee-800 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;