import GalleryPreview from './GalleryPreview';

export const dynamic='force-dynamic';

export default async function PartnerHotelMediaPreviewPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,organizationId=typeof query.organizationId==='string'?query.organizationId:'',serviceScopeId=typeof query.serviceScopeId==='string'?query.serviceScopeId:'';
 return <GalleryPreview organizationId={organizationId} serviceScopeId={serviceScopeId}/>;
}
