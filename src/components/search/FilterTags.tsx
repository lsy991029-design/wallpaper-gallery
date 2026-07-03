interface FilterTagsProps {
  tags: string[]
  activeTag: string | null
  onSelect: (tag: string | null) => void
}

export default function FilterTags({ tags, activeTag, onSelect }: FilterTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap sm:text-sm ${
          activeTag === null
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        全部
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap sm:text-sm ${
            activeTag === tag
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
