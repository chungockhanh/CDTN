import { useRoutes, Outlet, Navigate } from 'react-router-dom'
import ProductList from './pages/ProductList'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterLayout from './layout/RegisterLayout'
import MainLayout from './layout/MainLayout'
import { useContext } from 'react'
import { AppContext } from './contexts/app.context'
import path from './constants/path'
import ProductDetail from 'src/pages/ProductDetail'
import Cart from './pages/Cart'
import CartLayout from './pages/Cart/layout/CartLayout'
import UserLayout from './pages/User/layout/UserLayout'
import Profile from './pages/User/pages/Profile'
import ChangePassword from './pages/User/pages/ChangePassword'
import HistoryPurchase from './pages/User/pages/HistoryPurchase'
import AdminLayout from './pages/Admin/layout/AdminLayout'
import UserList from './pages/Admin/pages/UserManager/UserList'
import AddUser from './pages/Admin/pages/UserManager/AddUser'
import UpdateUser from './pages/Admin/pages/UserManager/UpdateUser'
import CategoryList from './pages/Admin/pages/CategoryManager/CategoryList'
import AddUpdateCategory from './pages/Admin/pages/CategoryManager/AddUpdateCategory'
import ProductListAdmin from './pages/Admin/pages/ProductManager/ProductListAdmin'
import AddProduct from './pages/Admin/pages/ProductManager/AddProduct'
import UpdateProduct from './pages/Admin/pages/ProductManager/UpdateProduct'
import PurchaseList from './pages/Admin/pages/PurchaseManager/PurchaseList'
import PurchaseDetail from './pages/Admin/pages/PurchaseManager/PurchaseDetail'
import Dashboard from './pages/Admin/pages/Dashboard'
import NotFound from './pages/NotFound'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function RejectedRoute() {
  const { isAuthenticated, profile } = useContext(AppContext)
  if (profile) {
    return profile?.roles[0] !== 'Admin' ? <Outlet /> : <Navigate to='/' />
  }
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

function AdminRoute() {
  const { profile } = useContext(AppContext)
  return profile?.roles[0] === 'Admin' ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: '',
      index: true,
      element: (
        <MainLayout>
          <ProductList />
        </MainLayout>
      )
    },
    {
      path: '*',
      element: (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )
    },
    {
      path: path.id,
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      )
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.cart,
          element: (
            <CartLayout>
              <Cart />
            </CartLayout>
          )
        },
        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          children: [
            {
              path: path.profile,
              element: <Profile />
            },
            {
              path: path.changePassword,
              element: <ChangePassword />
            },
            {
              path: path.historyPurchase,
              element: <HistoryPurchase />
            }
          ]
        },
        {
          path: path.admin,
          element: <AdminRoute />,
          children: [
            {
              path: '',
              element: (
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              )
            },
            {
              path: path.userManganer,
              children: [
                {
                  path: '',
                  element: (
                    <AdminLayout>
                      <UserList />
                    </AdminLayout>
                  )
                },
                {
                  path: 'add',
                  element: (
                    <AdminLayout>
                      <AddUser />
                    </AdminLayout>
                  )
                },
                {
                  path: path.id,
                  element: (
                    <AdminLayout>
                      <UpdateUser />
                    </AdminLayout>
                  )
                }
              ]
            },
            {
              path: path.categoryManganer,
              children: [
                {
                  path: '',
                  element: (
                    <AdminLayout>
                      <CategoryList />
                    </AdminLayout>
                  )
                },
                {
                  path: 'add',
                  element: (
                    <AdminLayout>
                      <AddUpdateCategory />
                    </AdminLayout>
                  )
                },
                {
                  path: path.id,
                  element: (
                    <AdminLayout>
                      <AddUpdateCategory />
                    </AdminLayout>
                  )
                }
              ]
            },
            {
              path: path.productManganer,
              children: [
                {
                  path: '',
                  element: (
                    <AdminLayout>
                      <ProductListAdmin />
                    </AdminLayout>
                  )
                },
                {
                  path: 'add',
                  element: (
                    <AdminLayout>
                      <AddProduct />
                    </AdminLayout>
                  )
                },
                {
                  path: path.id,
                  element: (
                    <AdminLayout>
                      <UpdateProduct />
                    </AdminLayout>
                  )
                }
              ]
            },
            {
              path: path.purchaseManganer,
              children: [
                {
                  path: '',
                  element: (
                    <AdminLayout>
                      <PurchaseList />
                    </AdminLayout>
                  )
                },
                {
                  path: path.id,
                  element: (
                    <AdminLayout>
                      <PurchaseDetail />
                    </AdminLayout>
                  )
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    }
  ])
  return routeElements
}
