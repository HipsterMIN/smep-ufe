import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header.jsx';
import Footer from '../components/ui/Footer.jsx';

const SubpageLayout = ({ children }) => {
  const location = useLocation();
  const isFrame = new URLSearchParams(location.search).get('iType') === 'frame';

  return (
    <div id="wrap">
      {!isFrame && <Header />}
      <div id="container" className="sub-container">
        <div className="inner in-between">
          {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
        </div>
      </div>
      {!isFrame && <Footer />}
    </div>
  );
};

export default SubpageLayout;