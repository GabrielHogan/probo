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

import { Button, IconPlusLarge, useDialogRef } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { ConnectionHandler, graphql, type PreloadedQuery, usePreloadedQuery } from "react-relay";

import type { CompliancePageFilesPageQuery } from "#/__generated__/core/CompliancePageFilesPageQuery.graphql";
import { useCompliancePortalId } from "#/hooks/useCompliancePortalId";

import { CompliancePageFileList } from "./_components/CompliancePageFileList";
import { NewCompliancePageFileDialog } from "./_components/NewCompliancePageFileDialog";

export const compliancePageFilesPageQuery = graphql`
  query CompliancePageFilesPageQuery($compliancePortalId: ID!) {
    compliancePortal: node(id: $compliancePortalId) {
      __typename
      ... on CompliancePortal {
        canCreateCompliancePageFile: permission(action: "compliance-portal:portal-file:create")
        ...CompliancePageFileList_compliancePortalFragment
      }
    }
  }
`;

export function CompliancePageFilesPage(props: {
  queryRef: PreloadedQuery<CompliancePageFilesPageQuery>;
}) {
  const { queryRef } = props;

  const compliancePortalId = useCompliancePortalId();
  const { t } = useTranslation("organizations/compliance-pages");
  const createDialogRef = useDialogRef();

  const data = usePreloadedQuery<CompliancePageFilesPageQuery>(compliancePageFilesPageQuery, queryRef);
  if (data.compliancePortal.__typename !== "CompliancePortal") {
    throw new Error("invalid type for node");
  }

  const filesConnectionId = ConnectionHandler.getConnectionID(
    compliancePortalId,
    "CompliancePageFileList_compliancePageFiles",
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">{t("filesPage.title")}</h3>
          <p className="text-sm text-txt-tertiary">
            {t("filesPage.description")}
          </p>
        </div>
        {data.compliancePortal.canCreateCompliancePageFile && (
          <Button
            icon={IconPlusLarge}
            onClick={() => createDialogRef.current?.open()}
          >
            {t("filesPage.actions.add")}
          </Button>
        )}
      </div>

      <CompliancePageFileList
        compliancePortalRef={data.compliancePortal}
        filesConnectionId={filesConnectionId}
      />

      <NewCompliancePageFileDialog
        connectionId={filesConnectionId}
        compliancePortalId={compliancePortalId}
        ref={createDialogRef}
      />
    </div>
  );
}
