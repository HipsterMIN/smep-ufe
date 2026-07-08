import { UserMenuProvider } from '../context/UserMenuContext.jsx';
import SubpageLayout from './SubpageLayout.jsx';
import { Outlet } from 'react-router-dom';
import PageViewTracker from '@components/analytics/PageViewTracker.jsx';
import BehaviorTracker from '@components/analytics/BehaviorTracker.jsx';

export const SubpageLayoutWithMenu = ({ children }) => (
  <UserMenuProvider>
    <PageViewTracker />
    <BehaviorTracker />
    <SubpageLayout>
      {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
    </SubpageLayout>
  </UserMenuProvider>
);

export const MenuProviderOnly = ({ children }) => (
  <UserMenuProvider>
    <PageViewTracker />
    <BehaviorTracker />
    {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
  </UserMenuProvider>
);

// ✅ SubpageLayout만 그대로 export
export { SubpageLayout };
