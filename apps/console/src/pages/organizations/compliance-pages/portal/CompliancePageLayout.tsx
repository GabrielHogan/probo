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

import { safeOpenUrl } from "@probo/helpers";
import { usePageTitle } from "@probo/hooks";
import { Badge, Breadcrumb, Button, IconBell2, IconCheckmark1, IconFolder2, IconMedal, IconPageTextLine, IconPencil, IconPeopleAdd, IconSettingsGear2, IconShield, IconStore, PageHeader, TabLink, Tabs } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { type PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Outlet } from "react-router";
import { graphql } from "relay-runtime";

import type { CompliancePageLayoutQuery } from "#/__generated__/core/CompliancePageLayoutQuery.graphql";
import { useCompliancePortalId } from "#/hooks/useCompliancePortalId";
import { useOrganizationId } from "#/hooks/useOrganizationId";

export const compliancePageLayoutQuery = graphql`
  query CompliancePageLayoutQuery($compliancePortalId: ID!) {
    compliancePortal: node(id: $compliancePortalId) {
      __typename
      ... on CompliancePortal {
        id
        entityName
        active
        publicUrl
      }
    }
  }
`;

export function CompliancePageLayout(props: { queryRef: PreloadedQuery<CompliancePageLayoutQuery> }) {
  const { queryRef } = props;

  const organizationId = useOrganizationId();
  const compliancePortalId = useCompliancePortalId();
  const { t } = useTranslation("organizations/compliance-pages");

  usePageTitle(t("layout.title"));

  const { compliancePortal } = usePreloadedQuery<CompliancePageLayoutQuery>(
    compliancePageLayoutQuery,
    queryRef,
  );
  if (compliancePortal.__typename !== "CompliancePortal") {
    throw new Error("invalid type for node");
  }

  const portalBase = `/organizations/${organizationId}/compliance-pages/${compliancePortalId}`;
  const compliancePageUrl = compliancePortal.publicUrl;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          {
            label: t("layout.breadcrumb"),
            to: `/organizations/${organizationId}/compliance-pages`,
          },
          {
            label: compliancePortal.entityName,
          },
        ]}
      />

      <PageHeader
        title={compliancePortal.entityName}
        description={t("layout.description")}
      >
        <Badge variant={compliancePortal.active ? "success" : "danger"}>
          {compliancePortal.active
            ? t("layout.status.active")
            : t("layout.status.inactive")}
        </Badge>
        {compliancePortal.active && compliancePageUrl && (
          <Button
            variant="secondary"
            onClick={() => safeOpenUrl(compliancePageUrl)}
          >
            {t("layout.actions.open")}
          </Button>
        )}
      </PageHeader>

      <Tabs>
        <TabLink to={portalBase} end>
          <IconSettingsGear2 className="size-4" />
          {t("layout.tabs.overview")}
        </TabLink>
        <TabLink to={`${portalBase}/brand`}>
          <IconPencil className="size-4" />
          {t("layout.tabs.brand")}
        </TabLink>
        <TabLink to={`${portalBase}/references`}>
          <IconCheckmark1 className="size-4" />
          {t("layout.tabs.references")}
        </TabLink>
        <TabLink to={`${portalBase}/commitments`}>
          <IconShield className="size-4" />
          {t("layout.tabs.commitments")}
        </TabLink>
        <TabLink to={`${portalBase}/audits`}>
          <IconMedal className="size-4" />
          {t("layout.tabs.audits")}
        </TabLink>
        <TabLink to={`${portalBase}/documents`}>
          <IconPageTextLine className="size-4" />
          {t("layout.tabs.documents")}
        </TabLink>
        <TabLink to={`${portalBase}/files`}>
          <IconFolder2 className="size-4" />
          {t("layout.tabs.files")}
        </TabLink>
        <TabLink to={`${portalBase}/third-parties`}>
          <IconStore className="size-4" />
          {t("layout.tabs.subprocessors")}
        </TabLink>
        <TabLink to={`${portalBase}/access`}>
          <IconPeopleAdd className="size-4" />
          {t("layout.tabs.access")}
        </TabLink>
        <TabLink to={`${portalBase}/mailing-list`}>
          <IconBell2 className="size-4" />
          {t("layout.tabs.mailingList")}
        </TabLink>
      </Tabs>

      <Outlet />
    </div>
  );
}
