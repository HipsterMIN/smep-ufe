// layouts/layoutIndex.jsx
import { UserMenuProvider } from '../context/UserMenuContext.jsx';
import SubpageLayout from './SubpageLayout.jsx';
import { Outlet } from 'react-router-dom';

// ✅ SubpageLayout + UserMenuProvider
export const SubpageLayoutWithMenu = () => (
  <UserMenuProvider>
    <SubpageLayout/>
  </UserMenuProvider>
);

// ✅ UserMenuProvider만 (Layout 없음)
export const MenuProviderOnly = () => (
  <UserMenuProvider>
    <Outlet />
  </UserMenuProvider>
);

// ✅ SubpageLayout만 그대로 export
export { SubpageLayout };
