import React from "react";
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="krds-breadcrumb-wrap" aria-label="현재 경로" id="breadcrumb">
      <ol className="breadcrumb">
        <li className="home">
          <Link to="/" className="txt">홈</Link>
        </li>
        {items.map((item, index) => (
          <li key={`${index}_${item}`}>
            <Link to={item.link || "/"} className="txt">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
