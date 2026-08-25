import { SliderManager } from "@/components/admin/slider-manager";
import { getSlides } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSliderPage() {
  const slides = await getSlides();
  return <SliderManager initialSlides={slides} />;
}
