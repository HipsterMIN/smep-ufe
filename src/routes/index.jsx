import { Routes, Route } from 'react-router-dom';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import UI_USR_L_010 from '../publishing/UI_USR_L_010.jsx';
import UI_USR_L_011 from '../publishing/UI_USR_L_011.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/publishing" element={<SubpageLayout />}>
        <Route path="UI_USR_L_010" element={<UI_USR_L_010 />} />
        <Route path="UI_USR_L_011" element={<UI_USR_L_011 />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
