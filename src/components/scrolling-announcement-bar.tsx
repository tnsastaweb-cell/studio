export function ScrollingAnnouncementBar() {
  const announcements = [
    "Special Offer: Free Shipping on Orders Over $50!",
    "New Arrivals: Check out the latest summer collection.",
    "Follow us on social media for updates.",
    "Customer Support available 24/7.",
  ];
  const fullText = announcements.join(" • ");

  return (
    <div className="bg-primary text-primary-foreground relative flex overflow-x-hidden h-10 items-center">
      <div className="py-2 animate-marquee whitespace-nowrap">
        <span className="mx-4 text-sm font-bold">{fullText}</span>
        <span className="mx-4 text-sm font-bold">{fullText}</span>
      </div>
      <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex items-center h-10">
        <span className="mx-4 text-sm font-bold">{fullText}</span>
        <span className="mx-4 text-sm font-bold">{fullText}</span>
      </div>
    </div>
  );
}
