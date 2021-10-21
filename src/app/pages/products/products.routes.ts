import { Routes } from '@angular/router';
import { ProductsComponent } from '@pages/products/products.component';
import { ProductListComponent } from '@pages/products/pages/product-list/product-list.component';
import { ProductSidebarResolver } from '@pages/products/pages/product-list/components/product-sidebar/product-sidebar.resolver';

export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    children: [
      {
        path: ':categoryId',
        data: {
          breadcrumb: (data: any) => `${data.cate.result[0]?.title}`,
        },
        resolve: { cate: ProductSidebarResolver },
        children: [
          {
            path: '',
            component: ProductListComponent,
            data: {
              breadcrumb: null,
            },
          },
        ],
      },
    ],
  },
];