import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const source = readFileSync('app/partner-preview/PartnerApplicationWorkspaceClient.tsx', 'utf8');
  test('autosave does not depend on returned readiness object identity', () => {
    expect(source).not.toContain('[activeStep, activeStepReadOnly, effectiveStep8Readiness,');
    expect(source).toContain('accountContactSaveKey(formRef.current) !== savedAccountContactRef.current');
    expect(source).toContain('form.countryCode, form.businessMobile');
  });
  test('loaded editor survives background reads but scope and errors fail closed', () => {
    expect(source).toContain('loadedApplicationScope !== applicationScope || !step8Readiness');
    expect(source).toContain('step8Readiness.organizationId !== bundle?.organization.id');
    expect(source).toContain('step8LoadStatus === "error"');
    expect(source).toContain('scope !== applicationScopeRef.current || request !== readinessRequestRef.current');
  });
  test('mobile send is guarded before saving, not after awaiting save', () => {
    const request = source.slice(source.indexOf('async function requestMobileOtp()'), source.indexOf('async function confirmMobileOtp()'));
    expect(request.indexOf('mobileRequestRef.current = true')).toBeLessThan(request.indexOf('await ensureDraft()'));
    expect(request).toContain('finally');
    expect(request).toContain('mobileRequestRef.current = false');
  });
