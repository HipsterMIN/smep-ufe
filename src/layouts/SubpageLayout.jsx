import { Outlet } from 'react-router-dom';
import Header from '../components/ui/Header.jsx';
import Footer from '../components/ui/Footer.jsx';

const SubpageLayout = () => {
  return (
    <div id="wrap">
      <Header />
      <div id="container">
        <div className="inner in-between">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubpageLayout;
