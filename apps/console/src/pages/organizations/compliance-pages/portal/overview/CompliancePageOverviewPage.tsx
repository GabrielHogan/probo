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

import { type PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";

import type { CompliancePageOverviewPageQuery } from "#/__generated__/core/CompliancePageOverviewPageQuery.graphql";

import { CompliancePageFrameworksSection } from "./_components/CompliancePageFrameworksSection";
import { CompliancePageNDASection } from "./_components/CompliancePageNDASection";
import { CompliancePageSlackSection } from "./_components/CompliancePageSlackSection";
import { CompliancePageStatusSection } from "./_components/CompliancePageStatusSection";

export const compliancePageOverviewPageQuery = graphql`
  query CompliancePageOverviewPageQuery($compliancePortalId: ID!, $organizationId: ID!) {
    compliancePortal: node(id: $compliancePortalId) {
      __typename
      ... on CompliancePortal {
        canGetNDA: permission(action: "compliance-portal:portal:get-nda")
        ...CompliancePageStatusSectionFragment
        ...CompliancePageFrameworksSectionFragment
        ...CompliancePageNDASectionFragment
      }
    }
    organization: node(id: $organizationId) {
      ...CompliancePageSlackSectionFragment
    }
  }
`;

export function CompliancePageOverviewPage(props: { queryRef: PreloadedQuery<CompliancePageOverviewPageQuery> }) {
  const { queryRef } = props;

  const data = usePreloadedQuery<CompliancePageOverviewPageQuery>(
    compliancePageOverviewPageQuery,
    queryRef,
  );
  if (data.compliancePortal.__typename !== "CompliancePortal") {
    throw new Error("invalid type for node");
  }

  const { compliancePortal, organization } = data;

  return (
    <div className="space-y-6">
      <CompliancePageStatusSection fragmentRef={compliancePortal} />

      <CompliancePageFrameworksSection fragmentRef={compliancePortal} />

      {compliancePortal.canGetNDA && (
        <CompliancePageNDASection fragmentRef={compliancePortal} />
      )}

      <CompliancePageSlackSection fragmentRef={organization} />
    </div>
  );
}
