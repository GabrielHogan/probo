// Copyright (c) 2025-2026 Probo Inc <hello@probo.com>.
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

package coredata

import (
	"github.com/jackc/pgx/v5"
	"go.probo.inc/probo/pkg/gid"
)

type (
	AuditFilter struct {
		compliancePortalVisibilities []CompliancePortalVisibility
		compliancePortalID           *gid.GID
		compliancePortalAuditIDs     []gid.GID
		hasCompliancePortalAuditIDs  bool
	}
)

func NewAuditFilter() *AuditFilter {
	return &AuditFilter{}
}

func NewAuditCompliancePortalFilter() *AuditFilter {
	return &AuditFilter{
		compliancePortalVisibilities: []CompliancePortalVisibility{
			CompliancePortalVisibilityPrivate,
			CompliancePortalVisibilityPublic,
		},
	}
}

func (f *AuditFilter) WithCompliancePortalID(compliancePortalID gid.GID) *AuditFilter {
	clone := *f
	clone.compliancePortalID = &compliancePortalID

	return &clone
}

func (f *AuditFilter) WithCompliancePortalVisibilities(visibilities ...CompliancePortalVisibility) *AuditFilter {
	f.compliancePortalVisibilities = visibilities
	return f
}

// withCompliancePortalAuditIDs pins the filter to the audits resolved from
// trust_center_audits by the caller. Audit queries never join that table, so
// the portal restriction is expressed as a plain identity predicate.
func (f *AuditFilter) withCompliancePortalAuditIDs(auditIDs []gid.GID) *AuditFilter {
	clone := *f
	clone.compliancePortalAuditIDs = auditIDs
	clone.hasCompliancePortalAuditIDs = true

	return &clone
}

// SQLArguments only declares the arguments that SQLFragment actually
// references. Callers merge them into a pgx.StrictNamedArgs, which rejects
// arguments the query never uses.
func (f *AuditFilter) SQLArguments() pgx.NamedArgs {
	args := pgx.NamedArgs{}

	if f.hasCompliancePortalAuditIDs {
		args["compliance_portal_audit_ids"] = f.compliancePortalAuditIDs
	}

	return args
}

func (f *AuditFilter) SQLFragment() string {
	if f.hasCompliancePortalAuditIDs {
		return "audits.id = ANY(@compliance_portal_audit_ids)"
	}

	// A portal visibility filter that was never resolved against
	// trust_center_audits cannot match anything.
	if f.compliancePortalVisibilities != nil {
		return "FALSE"
	}

	return "TRUE"
}
