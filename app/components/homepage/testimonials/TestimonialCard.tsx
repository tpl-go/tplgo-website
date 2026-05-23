interface Props {
  item: {
    id: number;
    name: string;
    location: string;
    type: string;
    image: string;
    review: string;
  };
}

export default function TestimonialCard({ item }: Props) {
  return (
    <div className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl hover:scale-105 transition duration-300">
      <div className="flex justify-center mb-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>

      <p className="text-sm mb-4">{item.review}</p>

      <h4 className="font-semibold">{item.name}</h4>
      <p className="text-xs text-gray-500">
        {item.location} • {item.type}
      </p>
    </div>
  );
}