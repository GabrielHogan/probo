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

import { graphql, type PreloadedQuery, usePreloadedQuery } from "react-relay";

import type { CompliancePageCommitmentsPageQuery } from "#/__generated__/core/CompliancePageCommitmentsPageQuery.graphql";

import { CompliancePageCommitmentGroupList } from "./_components/CompliancePageCommitmentGroupList";

export const compliancePageCommitmentsPageQuery = graphql`
  query CompliancePageCommitmentsPageQuery($compliancePortalId: ID!) {
    compliancePortal: node(id: $compliancePortalId) {
      __typename
      ... on CompliancePortal {
        id
        canCreateGroup: permission(action: "core:compliance-portal-commitment-group:create")
        ...CompliancePageCommitmentGroupListFragment
      }
    }
  }
`;

export function CompliancePageCommitmentsPage(props: { queryRef: PreloadedQuery<CompliancePageCommitmentsPageQuery> }) {
  const { queryRef } = props;

  const { compliancePortal } = usePreloadedQuery<CompliancePageCommitmentsPageQuery>(
    compliancePageCommitmentsPageQuery,
    queryRef,
  );
  if (compliancePortal.__typename !== "CompliancePortal") {
    throw new Error("invalid type for node");
  }

  return (
    <CompliancePageCommitmentGroupList
      fragmentRef={compliancePortal}
      compliancePortalId={compliancePortal.id}
      canCreate={compliancePortal.canCreateGroup}
    />
  );
}
