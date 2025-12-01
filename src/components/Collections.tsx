export default function CollectionListItem({ name, onSelect, isSelected }: any) {

    return <div
        onClick={() => {
            onSelect();
        }}
        className={`p-2 cursor-pointer rounded-md text-sm font-medium transition-colors 
        ${isSelected
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
    >
        📂 {name}
    </div>
}
