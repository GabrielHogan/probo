// Copyright (c) 2026 Probo Inc <hello@probo.com>.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { lazy } from "@probo/react-lazy";
import type { AppRoute } from "@probo/routes";
import { redirect } from "react-router";

import { LinkCardSkeleton } from "#/components/skeletons/LinkCardSkeleton";
import { PageSkeleton } from "#/components/skeletons/PageSkeleton";

export const compliancePagesRoutes = [
  {
    path: "compliance-pages",
    Fallback: PageSkeleton,
    Component: lazy(() => import("#/pages/organizations/compliance-pages/overview/CompliancePagesOverviewPageLoader")),
  },
  {
    path: "compliance-pages/new",
    Fallback: PageSkeleton,
    Component: lazy(() => import("#/pages/organizations/compliance-pages/NewCompliancePortalPage")),
  },
  {
    path: "compliance-page",
    loader: () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect("compliance-pages");
    },
  },
  {
    path: "compliance-page/*",
    loader: () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect("../compliance-pages");
    },
  },
  {
    path: "compliance-pages/:compliancePortalId",
    Fallback: PageSkeleton,
    Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/CompliancePageLayoutLoader")),
    children: [
      {
        index: true,
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/overview/CompliancePageOverviewPageLoader")),
      },
      {
        path: "brand",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/brand/CompliancePageBrandPageLoader")),
      },
      {
        path: "references",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/references/CompliancePageReferencesPageLoader")),
      },
      {
        path: "commitments",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/commitments/CompliancePageCommitmentsPageLoader")),
      },
      {
        path: "audits",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/audits/CompliancePageAuditsPageLoader")),
      },
      {
        path: "documents",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/documents/CompliancePageDocumentsPageLoader")),
      },
      {
        path: "files",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/files/CompliancePageFilesPageLoader")),
      },
      {
        path: "third-parties",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/third-parties/CompliancePageThirdPartiesPageLoader")),
      },
      {
        path: "access",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/access/CompliancePageAccessPageLoader")),
      },
      {
        path: "mailing-list",
        Fallback: LinkCardSkeleton,
        Component: lazy(() => import("#/pages/organizations/compliance-pages/portal/mailing-list/CompliancePageMailingListPageLoader")),
      },
    ],
  },
] satisfies AppRoute[];
