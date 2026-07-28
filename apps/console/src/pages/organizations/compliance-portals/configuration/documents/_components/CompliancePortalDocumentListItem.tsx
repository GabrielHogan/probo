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

import { getCompliancePortalVisibilityOptions } from "@probo/helpers";
import { Badge, DocumentTypeBadge, Field, Option, Td, Tr } from "@probo/ui";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

import type {
  CompliancePortalDocumentListItem_compliancePortalFragment$key,
} from "#/__generated__/core/CompliancePortalDocumentListItem_compliancePortalFragment.graphql";
import type {
  CompliancePortalDocumentListItem_documentFragment$key,
} from "#/__generated__/core/CompliancePortalDocumentListItem_documentFragment.graphql";
import type {
  CompliancePortalDocumentListItem_updateVisibilityMutation,
} from "#/__generated__/core/CompliancePortalDocumentListItem_updateVisibilityMutation.graphql";
import { useOrganizationId } from "#/hooks/useOrganizationId";
import { useMutation } from "#/lib/relay/useMutation";

import { CompliancePortalAliasField } from "../../_components/CompliancePortalAliasField";

const compliancePortalFragment = graphql`
  fragment CompliancePortalDocumentListItem_compliancePortalFragment on CompliancePortal {
    canUpdate: permission(action: "compliance-portal:portal:update")
  }
`;

const documentFragment = graphql`
  fragment CompliancePortalDocumentListItem_documentFragment on Document
  @argumentDefinitions(compliancePortalId: { type: "ID!" }) {
    id
    alias
    canSetAlias: permission(action: "resourcealias:alias:set")
    canRemoveAlias: permission(action: "resourcealias:alias:remove")
    compliancePortalVisibility(compliancePortalId: $compliancePortalId)
    latestPublishedVersion: versions(
      first: 1
      orderBy: { field: CREATED_AT, direction: DESC }
      filter: { statuses: [PUBLISHED] }
    ) {
      edges {
        node {
          title
          documentType
        }
      }
    }
  }
`;

const updateDocumentVisibilityMutation = graphql`
  mutation CompliancePortalDocumentListItem_updateVisibilityMutation(
    $input: UpdateCompliancePortalDocumentVisibilityInput!
    $compliancePortalId: ID!
  ) {
    updateCompliancePortalDocumentVisibility(input: $input) {
      document {
        ...CompliancePortalDocumentListItem_documentFragment
          @arguments(compliancePortalId: $compliancePortalId)
      }
    }
  }
`;

export function CompliancePortalDocumentListItem(props: {
  compliancePortalId: string;
  compliancePortalFragmentRef: CompliancePortalDocumentListItem_compliancePortalFragment$key;
  documentFragmentRef: CompliancePortalDocumentListItem_documentFragment$key;
}) {
  const { compliancePortalId, compliancePortalFragmentRef, documentFragmentRef } = props;

  const organizationId = useOrganizationId();
  const { t } = useTranslation("organizations/compliance-portals");
  const visibilityOptions = getCompliancePortalVisibilityOptions(t);

  const compliancePortal = useFragment<CompliancePortalDocumentListItem_compliancePortalFragment$key>(
    compliancePortalFragment,
    compliancePortalFragmentRef,
  );
  const document = useFragment<CompliancePortalDocumentListItem_documentFragment$key>(
    documentFragment,
    documentFragmentRef,
  );
  const [updateDocumentVisibility, isUpdatingDocumentVisibility]
    = useMutation<CompliancePortalDocumentListItem_updateVisibilityMutation>(
      updateDocumentVisibilityMutation,
      {
        successMessage: t("documentListItem.messages.visibilityUpdated"),
        errorToast: t("documentListItem.errors.updateVisibility"),
      },
    );
  const handleVsibilityChange = useCallback(
    async (value: string) => {
      const stringValue = typeof value === "string" ? value : "";
      const typedValue = stringValue as "NONE" | "PRIVATE" | "PUBLIC";
      await updateDocumentVisibility({
        variables: {
          input: {
            compliancePortalId,
            documentId: document.id,
            compliancePortalVisibility: typedValue,
          },
          compliancePortalId,
        },
      });
    },
    [compliancePortalId, document.id, updateDocumentVisibility],
  );

  const latestVersion = document.latestPublishedVersion.edges[0]?.node;
  const versionTitle = latestVersion?.title;

  return (
    <Tr to={`/organizations/${organizationId}/documents/${document.id}`}>
      <Td>
        <div className="flex gap-4 items-center">{versionTitle}</div>
      </Td>
      <Td>
        {latestVersion && <DocumentTypeBadge type={latestVersion.documentType} />}
      </Td>
      <Td noLink>
        <CompliancePortalAliasField
          resourceId={document.id}
          alias={document.alias}
          canSetAlias={document.canSetAlias}
          canRemoveAlias={document.canRemoveAlias}
        />
      </Td>
      <Td noLink width={130} className="pr-0">
        <Field
          type="select"
          value={document.compliancePortalVisibility}
          onValueChange={value => void handleVsibilityChange(value)}
          disabled={isUpdatingDocumentVisibility || !compliancePortal.canUpdate}
          className="w-[105px]"
        >
          {visibilityOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <Badge variant={option.variant}>{option.label}</Badge>
              </div>
            </Option>
          ))}
        </Field>
      </Td>
    </Tr>
  );
}
