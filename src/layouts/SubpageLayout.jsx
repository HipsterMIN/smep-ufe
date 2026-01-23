import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header.jsx';
import Footer from '../components/ui/Footer.jsx';
import { UserMenuProvider } from '../context/UserMenuContext.jsx';

const SubpageLayout = ({ children }) => {
  return (
    <div id="wrap">
      <Header />
      <div id="container">
        <div className="inner in-between">
          {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubpageLayout;
