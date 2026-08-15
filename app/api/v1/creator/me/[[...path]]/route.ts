import { handleCreatorWorkspaceRequest } from "@/app/lib/creators/creatorWorkspaceApi";

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return handleCreatorWorkspaceRequest(request, path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return handleCreatorWorkspaceRequest(request, path);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return handleCreatorWorkspaceRequest(request, path);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return handleCreatorWorkspaceRequest(request, path);
}
