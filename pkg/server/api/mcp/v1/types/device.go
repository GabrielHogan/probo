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

package types

import (
	"go.probo.inc/probo/pkg/coredata"
	"go.probo.inc/probo/pkg/page"
)

func NewDevice(d *coredata.Device) *Device {
	return &Device{
		ID:             d.ID,
		OrganizationID: d.OrganizationID,
		State:          d.State,
		Hostname:       d.Hostname,
		SerialNumber:   d.SerialNumber,
		Platform:       d.Platform,
		OsVersion:      d.OSVersion,
		AgentVersion:   d.AgentVersion,
		OwnerID:        d.OwnerID,
		EnrolledAt:     d.EnrolledAt,
		LastSeenAt:     d.LastSeenAt,
		RevokedAt:      d.RevokedAt,
		CreatedAt:      d.CreatedAt,
		UpdatedAt:      d.UpdatedAt,
	}
}

func NewListDevicesOutput(p *page.Page[*coredata.Device, coredata.DeviceOrderField]) ListDevicesOutput {
	devices := make([]*Device, 0, len(p.Data))
	for _, d := range p.Data {
		devices = append(devices, NewDevice(d))
	}

	var nextCursor *page.CursorKey

	if len(p.Data) > 0 {
		cursorKey := p.Data[len(p.Data)-1].CursorKey(p.Cursor.OrderBy.Field)
		nextCursor = &cursorKey
	}

	return ListDevicesOutput{
		NextCursor: nextCursor,
		Devices:    devices,
	}
}

func NewDevicePosture(p *coredata.DevicePosture) *DevicePosture {
	return &DevicePosture{
		CheckKey:   p.CheckKey,
		Status:     p.Status,
		ObservedAt: p.ObservedAt,
	}
}

func NewDevicePostureReport(r *coredata.DevicePostureReport) *DevicePostureReport {
	postures := make([]*DevicePosture, 0, len(r.Postures))
	for _, posture := range r.Postures {
		postures = append(postures, NewDevicePosture(posture))
	}

	return &DevicePostureReport{
		ID:        r.ID,
		DeviceID:  r.DeviceID,
		CreatedAt: r.CreatedAt,
		Postures:  postures,
	}
}

func NewListDevicePostureReportsOutput(
	p *page.Page[*coredata.DevicePostureReport, coredata.DevicePostureReportOrderField],
) ListDevicePostureReportsOutput {
	reports := make([]*DevicePostureReport, 0, len(p.Data))
	for _, r := range p.Data {
		reports = append(reports, NewDevicePostureReport(r))
	}

	var nextCursor *page.CursorKey

	if len(p.Data) > 0 {
		cursorKey := p.Data[len(p.Data)-1].CursorKey(p.Cursor.OrderBy.Field)
		nextCursor = &cursorKey
	}

	return ListDevicePostureReportsOutput{
		NextCursor:           nextCursor,
		DevicePostureReports: reports,
	}
}
