export function ScrollingAnnouncementBar() {
  const announcements = [
    "Website is in beta version and under progress. Please report any issues or feedback. This is a sample scrolling text for demonstration.",
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
