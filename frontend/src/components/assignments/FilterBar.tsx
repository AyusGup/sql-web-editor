import { DIFFICULTY } from '../../constants/query'
import type { Difficulty } from '../../constants/query'
import './FilterBar.scss'

interface Props {
    selected: Difficulty | ''
    onChange: (d: Difficulty | '') => void
}

const OPTIONS = [
    { label: 'All', value: '' as Difficulty | '' },
    { label: 'Easy', value: DIFFICULTY.EASY },
    { label: 'Medium', value: DIFFICULTY.MEDIUM },
    { label: 'Hard', value: DIFFICULTY.HARD },
]

export default function FilterBar({ selected, onChange }: Props) {
    return (
        <div className="filter-bar" role="group" aria-label="Filter by difficulty">
            {OPTIONS.map(({ label, value }) => (
                <button
                    key={label}
                    className={`filter-pill${selected === value ? ' filter-pill-active' : ''}`}
                    onClick={() => onChange(value)}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}
