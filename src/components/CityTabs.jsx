const cities = ['Bucaramanga', 'Girón', 'Floridablanca']

export default function CityTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 border-b border-zinc-800 pb-1 overflow-x-auto">
      {cities.map(city => (
        <button
          key={city}
          onClick={() => onChange(city)}
          className={`px-6 py-2.5 text-sm font-medium rounded-t-2xl whitespace-nowrap transition-all ${
            active === city 
              ? 'bg-zinc-900 border border-zinc-800 border-b-transparent text-white' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  )
}