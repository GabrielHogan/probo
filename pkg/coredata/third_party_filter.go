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
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"go.gearno.de/kit/pg"
	"go.probo.inc/probo/pkg/gid"
)

type (
	ThirdPartyFilter struct {
		compliancePortalID               *gid.GID
		compliancePortalThirdPartyIDs    []gid.GID
		hasCompliancePortalThirdPartyIDs bool
		showOnCompliancePortal           *bool
		level                            *int
		query                            *string
		category                         *ThirdPartyCategory
		country                          *CountryCode
	}
)

func NewThirdPartyFilter(
	showOnCompliancePortal *bool,
	level *int,
	query *string,
	category *ThirdPartyCategory,
	country *CountryCode,
) *ThirdPartyFilter {
	return &ThirdPartyFilter{
		showOnCompliancePortal: showOnCompliancePortal,
		level:                  level,
		query:                  query,
		category:               category,
		country:                country,
	}
}

func (f *ThirdPartyFilter) WithCompliancePortalID(compliancePortalID gid.GID) *ThirdPartyFilter {
	clone := *f
	clone.compliancePortalID = &compliancePortalID

	return &clone
}

// withCompliancePortalThirdPartyIDs pins the filter to the third parties
// resolved from trust_center_third_parties by the caller. Third-party queries
// never join that table, so the portal restriction is expressed as a plain
// identity predicate.
func (f *ThirdPartyFilter) withCompliancePortalThirdPartyIDs(thirdPartyIDs []gid.GID) *ThirdPartyFilter {
	clone := *f
	clone.compliancePortalThirdPartyIDs = thirdPartyIDs
	clone.hasCompliancePortalThirdPartyIDs = true

	return &clone
}

// resolveCompliancePortal turns a "published on this portal" request into the
// concrete third-party IDs backing it. Loaders call it before building their
// query so that no third-party query has to reach into the portal tables.
func (f *ThirdPartyFilter) resolveCompliancePortal(
	ctx context.Context,
	conn pg.Querier,
	scope Scoper,
) (*ThirdPartyFilter, error) {
	if f.compliancePortalID == nil || f.showOnCompliancePortal == nil || !*f.showOnCompliancePortal {
		return f, nil
	}

	thirdPartyIDs, err := LoadThirdPartyIDsByCompliancePortalID(ctx, conn, scope, *f.compliancePortalID)
	if err != nil {
		return nil, fmt.Errorf("cannot load compliance portal third parties: %w", err)
	}

	return f.withCompliancePortalThirdPartyIDs(thirdPartyIDs), nil
}

func (f *ThirdPartyFilter) SQLArguments() pgx.StrictNamedArgs {
	args := pgx.StrictNamedArgs{
		"compliance_portal_third_party_ids": nil,
		"show_on_trust_center":              nil,
		"filter_query":                      nil,
		"level":                             nil,
		"filter_category":                   nil,
		"filter_country":                    nil,
	}

	if f.hasCompliancePortalThirdPartyIDs {
		ids := make([]string, len(f.compliancePortalThirdPartyIDs))
		for i, id := range f.compliancePortalThirdPartyIDs {
			ids[i] = id.String()
		}

		args["compliance_portal_third_party_ids"] = ids
	}

	if f.showOnCompliancePortal != nil {
		args["show_on_trust_center"] = *f.showOnCompliancePortal
	}

	if f.query != nil && *f.query != "" {
		args["filter_query"] = *f.query
	}

	if f.level != nil {
		args["level"] = *f.level
	}

	if f.category != nil {
		args["filter_category"] = string(*f.category)
	}

	if f.country != nil {
		args["filter_country"] = string(*f.country)
	}

	return args
}

func (f *ThirdPartyFilter) SQLFragment() string {
	return `
(
	CASE
		WHEN @compliance_portal_third_party_ids::text[] IS NOT NULL THEN
			third_parties.id = ANY(@compliance_portal_third_party_ids::text[])
		-- A portal publication filter that was never resolved against
		-- trust_center_third_parties cannot match anything.
		WHEN @show_on_trust_center::boolean IS NOT NULL THEN
			FALSE
		ELSE TRUE
	END
	AND CASE
		WHEN @level::integer IS NOT NULL THEN
			level = @level::integer
		ELSE TRUE
	END
	AND CASE
		WHEN @filter_query::text IS NOT NULL AND @filter_query::text <> '' THEN
			name ILIKE '%' || @filter_query || '%'
		ELSE TRUE
	END
	AND CASE
		WHEN @filter_category::text IS NOT NULL THEN
			category = @filter_category::third_party_category
		ELSE TRUE
	END
	AND CASE
		WHEN @filter_country::text IS NOT NULL THEN
			@filter_country::country_code = ANY(countries)
		ELSE TRUE
	END
)`
}
