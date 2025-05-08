import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCreditCard, faExchangeAlt, faChartBar, faPiggyBank, faFileAlt, faCog, faQuestionCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <FontAwesomeIcon icon={faPiggyBank} size="2x" />
          <span className="sidebar-title">BudgetPro</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => navigate('/dashboard')}><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</li>
            <li><FontAwesomeIcon icon={faCreditCard} /> Payment</li>
            <li><FontAwesomeIcon icon={faExchangeAlt} /> Transaction</li>
            <li><FontAwesomeIcon icon={faChartBar} /> Reports</li>
            <li><FontAwesomeIcon icon={faFileAlt} /> Documents</li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <FontAwesomeIcon icon={faUserCircle} size="lg" />
          <span>{userName || 'User'}</span>
        </div>
        <div className="sidebar-actions">
          <FontAwesomeIcon icon={faCog} title="Settings" />
          <FontAwesomeIcon icon={faQuestionCircle} title="Help" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 