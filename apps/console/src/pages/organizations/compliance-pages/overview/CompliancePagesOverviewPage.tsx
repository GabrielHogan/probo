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

import { usePageTitle } from "@probo/hooks";
import { Button, Card, IconChevronDown, PageHeader, Spinner } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { type PreloadedQuery, usePaginationFragment, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";

import type {
  CompliancePagesOverviewPage_organization$key,
} from "#/__generated__/core/CompliancePagesOverviewPage_organization.graphql";
import type {
  CompliancePagesOverviewPageQuery,
} from "#/__generated__/core/CompliancePagesOverviewPageQuery.graphql";
import type {
  CompliancePagesOverviewPageRefetchQuery,
} from "#/__generated__/core/CompliancePagesOverviewPageRefetchQuery.graphql";
import { useOrganizationId } from "#/hooks/useOrganizationId";

import { CompliancePortalEmptyState } from "./_components/CompliancePortalEmptyState";
import { CompliancePortalListItem } from "./_components/CompliancePortalListItem";

export const compliancePagesOverviewPageQuery = graphql`
  query CompliancePagesOverviewPageQuery($organizationId: ID!) {
    organization: node(id: $organizationId) {
      __typename
      ... on Organization {
        ...CompliancePagesOverviewPage_organization
      }
    }
  }
`;

const compliancePortalsFragment = graphql`
  fragment CompliancePagesOverviewPage_organization on Organization
  @refetchable(queryName: "CompliancePagesOverviewPageRefetchQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 50 }
    after: { type: "CursorKey", defaultValue: null }
  ) {
    compliancePortals(
      first: $first
      after: $after
      orderBy: { field: CREATED_AT, direction: DESC }
    ) @connection(key: "CompliancePagesOverviewPage_compliancePortals", filters: []) {
      edges {
        node {
          id
          ...CompliancePortalListItem_compliancePortal
        }
      }
    }
  }
`;

interface CompliancePagesOverviewPageProps {
  queryRef: PreloadedQuery<CompliancePagesOverviewPageQuery>;
}

export function CompliancePagesOverviewPage({ queryRef }: CompliancePagesOverviewPageProps) {
  const { t } = useTranslation("organizations/compliance-pages");
  const organizationId = useOrganizationId();

  usePageTitle(t("overviewPage.title"));

  const { organization } = usePreloadedQuery<CompliancePagesOverviewPageQuery>(
    compliancePagesOverviewPageQuery,
    queryRef,
  );
  if (organization.__typename !== "Organization") {
    throw new Error("invalid type for node");
  }

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    CompliancePagesOverviewPageRefetchQuery,
    CompliancePagesOverviewPage_organization$key
  >(compliancePortalsFragment, organization);

  const portals = data.compliancePortals.edges.map(e => e.node);
  const newPortalHref = `/organizations/${organizationId}/compliance-pages/new`;

  if (portals.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("overviewPage.title")}
          description={t("overviewPage.description")}
        />
        <CompliancePortalEmptyState>
          <Button to={newPortalHref}>{t("overviewPage.actions.createFirst")}</Button>
        </CompliancePortalEmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("overviewPage.title")}
        description={t("overviewPage.description")}
      />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button to={newPortalHref}>{t("overviewPage.actions.create")}</Button>
        </div>

        <Card className="divide-y divide-border-low rounded-lg">
          {portals.map(portal => (
            <CompliancePortalListItem
              key={portal.id}
              compliancePortalKey={portal}
            />
          ))}
        </Card>

        {hasNext && (
          <Button
            variant="tertiary"
            onClick={() => loadNext(50)}
            disabled={isLoadingNext}
            className="mt-3 mx-auto"
            icon={IconChevronDown}
          >
            {isLoadingNext && <Spinner />}
            {t("overviewPage.actions.showMore")}
          </Button>
        )}
      </div>
    </div>
  );
}
