import ServiceDetailsMain from "./ServiceDetailsMain";

export default async function Page({
  params,
}) {
  const { serviceId } =
    await params;

  return (
    <ServiceDetailsMain
      serviceId={serviceId}
    />
  );
}