"use client";

export default function DestinationCard({ d, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center group"
    >
      <div
        className="
          flex h-[160px] w-[160px]
          items-center justify-center
          overflow-hidden
          rounded-full
          bg-[#cde7f6]
          shadow-md
          transition duration-300
          group-hover:animate-[swingRotate_0.6s_ease-in-out_infinite]
        "
      >
        <img
          src={d.img}
          alt={d.name}
          className="
            h-full w-full
            object-contain
            transition duration-300
            group-hover:-rotate-[30deg]
          "
        />
      </div>

      <p
        className="
          mt-3
          text-lg
          font-semibold
          tracking-wide
          text-black
          transition-all
          duration-300
          group-hover:scale-110
          group-hover:tracking-wider
        "
      >
        {d.name}
      </p>
    </div>
  );
}