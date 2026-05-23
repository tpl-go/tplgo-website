"use client";

export default function DestinationCard({ d, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group"
    >
      <div
        className="
w-[160px] h-[160px]
rounded-full
bg-[#cde7f6]
flex items-center justify-center
overflow-hidden
shadow-md
transition duration-300
group-hover:animate-[swingRotate_0.6s_ease-in-out_infinite]
"
      >
        <img
          src={d.img}
          className="
w-full h-full
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
transition-all
duration-300
text-black
group-hover:tracking-wider
group-hover:scale-110
"
      >
        {d.name}
      </p>
    </div>
  );
}