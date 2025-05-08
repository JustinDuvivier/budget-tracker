import React from 'react';
import './Home.css';
import homeImg from '../../images/homescreen.png';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mock navigation bar with links and action buttons */}
      <nav className="mock-navbar">
        <div className="mock-navbar-links">
          <span className="mock-navbar-link active">HOME</span>
          <span className="mock-navbar-link">COMPANIES</span>
          <span className="mock-navbar-link">MEMBERS</span>
        </div>
        <div className="mock-navbar-actions">
          <button className="mock-navbar-btn demo">REQUEST DEMO</button>
          <button className="mock-navbar-btn start" onClick={() => navigate('/input')}>GET STARTED</button>
        </div>
      </nav>

      {/* Hero section*/}
      <div className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Smarter debt payoff and financial clarity<br />
            for every household
          </h1>
          <p className="home-hero-subtitle">
            Take control of your finances with our intelligent automation platform. We combine technology and expertise to help you pay off debt faster and optimize your monthly budget.
          </p>
          <button className="home-hero-btn" onClick={() => navigate('/input')}>Get Started</button>
        </div>

        {/* hero image*/}
        <div className="home-hero-image">
          <img src={homeImg} alt="Debt repayment automation illustration" />
        </div>
      </div>
    </>
  );
};

export default Home;
