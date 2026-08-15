function flag(name: string) {
  return process.env[name] === "true";
}

export function isCreatorWorkspaceBackendEnabled() {
  return flag("TPL_CREATOR_WORKSPACE_BACKEND_ENABLED") || flag("NEXT_PUBLIC_TPL_CREATOR_WORKSPACE_BACKEND");
}

export function isCreatorProfileMutationsEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_PROFILE_MUTATIONS_ENABLED");
}

export function isCreatorOnboardingMutationsEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_ONBOARDING_MUTATIONS_ENABLED");
}

export function isCreatorAssetDraftMutationsEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_ASSET_DRAFT_MUTATIONS_ENABLED");
}

export function isCreatorCollectionMutationsEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_COLLECTION_MUTATIONS_ENABLED");
}

export function isCreatorVersionDraftMutationsEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_VERSION_DRAFT_MUTATIONS_ENABLED");
}

export function isCreatorUploadSessionMetadataEnabled() {
  return isCreatorWorkspaceBackendEnabled() && flag("TPL_CREATOR_UPLOAD_SESSION_METADATA_ENABLED");
}
