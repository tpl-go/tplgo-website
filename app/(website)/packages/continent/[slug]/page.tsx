type Props = {
  params: Promise<{ slug: string }>
}

export default async function ContinentPackagePage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        Continent Package: {slug}
      </h1>

      <p className="text-lg text-gray-300">
        Dynamic continent package page for {slug}.
      </p>
    </main>
  )
}