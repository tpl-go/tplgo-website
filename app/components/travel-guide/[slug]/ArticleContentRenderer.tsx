import type { TravelGuideBlock } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  blocks: TravelGuideBlock[];
};

function makeHeadingId(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function ArticleContentRenderer({ blocks }: Props) {
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="text-gray-700 leading-8 text-[17px]"
            >
              {block.content}
            </p>
          );
        }

        if (block.type === "heading") {
          const headingId = makeHeadingId(block.content);

          return (
            <h2
              key={index}
              id={headingId}
              className="scroll-mt-28 text-3xl font-bold text-gray-900 pt-3"
            >
              {block.content}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-4">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-gray-700 leading-7"
                >
                  <span className="mt-1 text-green-600">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <div
              key={index}
              className="rounded-3xl border-l-4 border-orange-500 bg-orange-50 p-7"
            >
              <p className="text-lg italic leading-8 text-gray-800">
                “{block.content}”
              </p>
            </div>
          );
        }

        if (block.type === "faq") {
          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900">
                {block.question}
              </h3>

              <p className="mt-3 text-gray-600 leading-7">
                {block.answer}
              </p>
            </div>
          );
        }

        if (block.type === "cta") {
          return (
            <div
              key={index}
              className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white"
            >
              <h3 className="text-2xl font-bold">{block.title}</h3>

              <p className="mt-4 leading-7 text-white/90">
                {block.description}
              </p>

              <a
                href={block.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 transition"
              >
                {block.buttonText}
              </a>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}