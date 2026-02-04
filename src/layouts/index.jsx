import { UserMenuProvider } from '../context/UserMenuContext.jsx';
import SubpageLayout from './SubpageLayout.jsx';
import { Outlet } from 'react-router-dom';

// ✅ SubpageLayout + UserMenuProvider
export const SubpageLayoutWithMenu = ({ children }) => (
  <UserMenuProvider>
    <SubpageLayout>
      {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
    </SubpageLayout>
  </UserMenuProvider>
);

// ✅ UserMenuProvider만 (Layout 없음)
export const MenuProviderOnly = ({ children }) => (
  <UserMenuProvider>
    {children || <Outlet />}  {/* ✅ children 우선, 없으면 Outlet */}
  </UserMenuProvider>
);

// ✅ SubpageLayout만 그대로 export
export { SubpageLayout };
