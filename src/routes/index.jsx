import { Routes, Route } from 'react-router-dom';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import UI_USR_L_010 from '../publishing/UI_USR_L_010.jsx';
import UI_USR_L_011 from '../publishing/UI_USR_L_011.jsx';
import UI_USR_R_005 from '../publishing/UI_USR_R_005.jsx';
import UI_USR_R_480 from '../publishing/UI_USR_R_480.jsx';
import UI_USR_L_510 from '../publishing/UI_USR_L_510.jsx';
import MainPage from '../publishing/MainPage.jsx';
import PublishingList from '../publishing/PublishingList.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* SubpageLayout */}
      <Route path="/publishing" element={<SubpageLayout />}>
        <Route index element={<PublishingList />} />
        <Route path="UI_USR_L_010" element={<UI_USR_L_010 />} />
        <Route path="UI_USR_L_011" element={<UI_USR_L_011 />} />
        <Route path="UI_USR_R_480" element={<UI_USR_R_480 />} />
        <Route path="UI_USR_L_510" element={<UI_USR_L_510 />} />
      </Route>

      {/* no SubpageLayout */}
      <Route path="/publishing">
        <Route path="main" element={<MainPage />} />
        <Route path="UI_USR_R_005" element={<UI_USR_R_005 />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
